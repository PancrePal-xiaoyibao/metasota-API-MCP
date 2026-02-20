#!/usr/bin/env node
import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { z } from 'zod';

// ==================== 类型定义 ====================

// 搜索响应Schema (实际API格式)
const SearchResponseSchema = z.object({
  credits: z.number().optional(),
  searchParameters: z.object({
    q: z.string(),
    size: z.number().optional(),
    searchFile: z.boolean().optional(),
    includeSummary: z.boolean().optional(),
    conciseSnippet: z.boolean().optional(),
    format: z.string().optional(),
  }).optional(),
  webpages: z.array(z.object({
    title: z.string(),
    link: z.string(),
    score: z.string().optional(),
    snippet: z.string().optional(),
    position: z.number().optional(),
    date: z.string().optional(),
    rawContent: z.string().optional(),
  })).optional(),
  documents: z.array(z.object({
    title: z.string(),
    link: z.string(),
    snippet: z.string().optional(),
    position: z.number().optional(),
  })).optional(),
  images: z.array(z.object({
    title: z.string().optional(),
    link: z.string(),
    thumbnail: z.string().optional(),
  })).optional(),
  videos: z.array(z.object({
    title: z.string(),
    link: z.string(),
    snippet: z.string().optional(),
  })).optional(),
  total: z.number().optional(),
  summary: z.string().optional(),
});

// Reader响应Schema (JSON格式 - 实际API格式)
const ReaderJsonResponseSchema = z.object({
  title: z.string().optional(),
  url: z.string().optional(),
  author: z.string().optional(),
  date: z.string().optional(),
  markdown: z.string().optional(),
  content: z.string().optional(),
  credits: z.number().optional(),
});

// 搜索参数类型
interface SearchParams {
  q: string;
  scope?: 'webpage' | 'document' | 'paper' | 'image' | 'video' | 'podcast';
  includeSummary?: boolean;
  includeRawContent?: boolean;
  size?: number;
  conciseSnippet?: boolean;
}

// Reader参数类型
interface ReaderParams {
  url: string;
  format?: 'markdown' | 'json';
}

// ==================== 配置管理 ====================

const API_KEY = process.env.METASO_API_KEY;
const API_BASE_URL = process.env.METASO_BASE_URL || 'https://metaso.cn/api/v1';
const API_TIMEOUT = parseInt(process.env.METASO_TIMEOUT || '60000', 10);

// 默认搜索配置
const validSearchScopes: Array<'webpage' | 'document' | 'paper' | 'image' | 'video' | 'podcast'> = 
  ['webpage', 'document', 'paper', 'image', 'video', 'podcast'];
const envSearchScope = process.env.METASO_DEFAULT_SEARCH_SCOPE;
const DEFAULT_SEARCH_SCOPE: 'webpage' | 'document' | 'paper' | 'image' | 'video' | 'podcast' = 
  (envSearchScope && validSearchScopes.includes(envSearchScope as any))
    ? (envSearchScope as 'webpage' | 'document' | 'paper' | 'image' | 'video' | 'podcast')
    : 'webpage';
const DEFAULT_SEARCH_SIZE = (() => {
  const envSize = process.env.METASO_DEFAULT_SEARCH_SIZE;
  if (!envSize) return 10; // 如果环境变量不存在或为空，返回默认值 10
  const parsed = parseInt(envSize, 10);
  if (isNaN(parsed)) return 10; // 如果解析失败，返回默认值 10
  return Math.min(Math.max(parsed, 1), 100); // 确保值在 1-100 范围内
})();
const DEFAULT_INCLUDE_SUMMARY = process.env.METASO_DEFAULT_INCLUDE_SUMMARY === 'true';
const DEFAULT_INCLUDE_RAW_CONTENT = process.env.METASO_DEFAULT_INCLUDE_RAW_CONTENT === 'true';
const DEFAULT_CONCISE_SNIPPET = process.env.METASO_DEFAULT_CONCISE_SNIPPET === 'true';

// 默认读取配置
const validReaderFormats: Array<'markdown' | 'json'> = ['markdown', 'json'];
const envReaderFormat = process.env.METASO_DEFAULT_READER_FORMAT;
const DEFAULT_READER_FORMAT: 'markdown' | 'json' = 
  (envReaderFormat && validReaderFormats.includes(envReaderFormat as any))
    ? (envReaderFormat as 'markdown' | 'json')
    : 'markdown';

// ==================== 工具定义 ====================

const TOOLS = [
  // 搜索工具
  {
    name: 'metaso_search',
    description: `使用秘塔AI搜索进行多维度搜索。

支持的搜索范围 (scope):
- webpage: 网页搜索 (默认)
- document: 文库搜索
- paper: 学术论文搜索
- image: 图片搜索
- video: 视频搜索
- podcast: 播客/博客搜索

特色功能:
- includeSummary: 通过网页摘要增强召回
- includeRawContent: 抓取来源网页原文
- conciseSnippet: 返回精简的原文匹配信息`,
    inputSchema: {
      type: 'object',
      properties: {
        q: {
          type: 'string',
          description: '搜索查询关键词 (必填)',
        },
        scope: {
          type: 'string',
          description: '搜索范围',
          enum: ['webpage', 'document', 'paper', 'image', 'video', 'podcast'],
          default: DEFAULT_SEARCH_SCOPE,
        },
        includeSummary: {
          type: 'boolean',
          description: '是否通过网页摘要增强召回，可获取综合摘要',
          default: DEFAULT_INCLUDE_SUMMARY,
        },
        includeRawContent: {
          type: 'boolean',
          description: '是否抓取所有来源网页原文',
          default: DEFAULT_INCLUDE_RAW_CONTENT,
        },
        size: {
          type: 'number',
          description: `返回结果数量 (1-100)，默认: ${DEFAULT_SEARCH_SIZE}`,
          default: DEFAULT_SEARCH_SIZE,
          minimum: 1,
          maximum: 100,
        },
        conciseSnippet: {
          type: 'boolean',
          description: '是否返回精简的原文匹配信息',
          default: DEFAULT_CONCISE_SNIPPET,
        },
      },
      required: ['q'],
    },
  },

  // 网页读取工具
  {
    name: 'metaso_reader',
    description: `读取指定URL的网页内容并转换为结构化格式。

支持的输出格式:
- markdown: 返回Markdown格式的网页内容 (默认)
- json: 返回JSON格式，包含标题、URL、内容等结构化信息

适用场景:
- 提取新闻文章内容
- 获取网页正文
- 将网页转换为可读格式`,
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: '要读取的网页URL (必填)',
        },
        format: {
          type: 'string',
          description: '输出格式',
          enum: ['markdown', 'json'],
          default: DEFAULT_READER_FORMAT,
        },
      },
      required: ['url'],
    },
  },
];

if (!API_KEY) {
  console.error('❌ 错误: 必须设置 METASO_API_KEY 环境变量');
  console.error('请访问 https://metaso.cn/search-api/api-keys 获取 API Key');
  process.exit(1);
}

// 创建axios实例
const createAxiosInstance = (): AxiosInstance => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: API_TIMEOUT,
  });
};

const axiosInstance = createAxiosInstance();

// ==================== 工具执行逻辑 ====================

/**
 * 执行搜索
 */
async function performSearch(params: SearchParams): Promise<string> {
  try {
    const scope = params.scope || DEFAULT_SEARCH_SCOPE;
    const response = await axiosInstance.post('/search', {
      q: params.q,
      scope: scope,
      includeSummary: params.includeSummary ?? DEFAULT_INCLUDE_SUMMARY,
      includeRawContent: params.includeRawContent ?? DEFAULT_INCLUDE_RAW_CONTENT,
      size: Math.min(Math.max(params.size ?? DEFAULT_SEARCH_SIZE, 1), 100),
      conciseSnippet: params.conciseSnippet ?? DEFAULT_CONCISE_SNIPPET,
    });

    const parsed = SearchResponseSchema.parse(response.data);
    const scopeLabel = getScopeLabel(scope);

    // 根据搜索范围获取对应的结果数组
    let results: Array<{ title: string; link: string; snippet?: string; rawContent?: string }> = [];
    
    switch (scope) {
      case 'webpage':
        results = parsed.webpages || [];
        break;
      case 'document':
        results = parsed.documents || [];
        break;
      case 'image':
        results = (parsed.images || []).map(img => ({
          title: img.title || '图片',
          link: img.link,
          snippet: img.thumbnail ? `缩略图: ${img.thumbnail}` : undefined,
        }));
        break;
      case 'video':
        results = parsed.videos || [];
        break;
      default:
        results = parsed.webpages || [];
    }

    let output = `🔍 **${scopeLabel}搜索**: "${params.q}"\n`;
    output += `📊 找到 ${parsed.total || results.length} 个结果，返回 ${results.length} 条\n\n`;

    if (results.length === 0) {
      output += '未找到相关结果。\n';
      return output;
    }

    results.forEach((result, index) => {
      output += `### ${index + 1}. ${result.title}\n`;
      output += `🔗 ${result.link}\n`;
      if (result.snippet) {
        output += `📄 ${result.snippet}\n`;
      }
      if (params.includeRawContent && result.rawContent) {
        const preview = result.rawContent.length > 500 
          ? result.rawContent.substring(0, 500) + '...' 
          : result.rawContent;
        output += `📰 **原文内容**:\n${preview}\n`;
      }
      output += '\n';
    });

    if (parsed.summary) {
      output += `---\n📊 **综合摘要**:\n${parsed.summary}\n`;
    }

    return output;
  } catch (error) {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      throw new Error(`API请求失败 (${status}): ${message}`);
    }
    throw error;
  }
}

/**
 * 读取网页内容
 */
async function performRead(params: ReaderParams): Promise<string> {
  try {
    const format = params.format || DEFAULT_READER_FORMAT;
    const acceptHeader = format === 'json' ? 'application/json' : 'text/plain';

    const response = await axiosInstance.post('/reader', 
      { url: params.url },
      {
        headers: {
          'Accept': acceptHeader,
        },
      }
    );

    if (format === 'json') {
      const parsed = ReaderJsonResponseSchema.parse(response.data);

      let output = `📖 **网页读取结果** (JSON格式)\n\n`;
      output += `🔗 **URL**: ${parsed.url || params.url}\n`;
      
      if (parsed.title) {
        output += `📌 **标题**: ${parsed.title}\n`;
      }
      if (parsed.author) {
        output += `✍️ **作者**: ${parsed.author}\n`;
      }
      if (parsed.date) {
        output += `📅 **日期**: ${parsed.date}\n`;
      }
      if (parsed.content || parsed.markdown) {
        output += `\n---\n**内容**:\n${parsed.content || parsed.markdown}\n`;
      }
      
      return output;
    } else {
      // Markdown格式直接返回
      let output = `📖 **网页读取结果** (Markdown格式)\n\n`;
      output += `🔗 **URL**: ${params.url}\n\n`;
      output += `---\n${response.data}\n`;
      return output;
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      throw new Error(`网页读取失败 (${status}): ${message}`);
    }
    throw error;
  }
}

// ==================== 辅助函数 ====================

function getScopeLabel(scope: string): string {
  const labels: Record<string, string> = {
    webpage: '网页',
    document: '文库',
    paper: '学术',
    scholar: '学术',
    image: '图片',
    video: '视频',
    podcast: '播客',
  };
  return labels[scope] || scope;
}


// ==================== MCP服务器 ====================

class MetasoMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'metaso-search-mcp',
        version: '1.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOLS,
    }));

    // 执行工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result: string;

        switch (name) {
          case 'metaso_search':
            result = await performSearch(args as unknown as SearchParams);
            break;

          case 'metaso_reader':
            result = await performRead(args as unknown as ReaderParams);
            break;

          default:
            throw new Error(`未知工具: ${name}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[Tool Error] ${name}:`, errorMessage);
        
        return {
          content: [
            {
              type: 'text',
              text: `❌ 工具执行失败: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🚀 秘塔搜索 MCP 服务器已启动 (stdio模式)');
    console.error(`📡 API端点: ${API_BASE_URL}`);
  }
}

// ==================== 主入口 ====================

const server = new MetasoMCPServer();
server.run().catch((error) => {
  console.error('❌ 服务器启动失败:', error);
  process.exit(1);
});

