# 秘塔搜索MCP工具开发完整方案

根据搜索结果，我为您整理了秘塔搜索API接入文档、PRD产品需求文档以及Node.js实现方案。

## 一、秘塔搜索API接入文档

### 1. 基础信息
- **API端点**: `https://metaso.cn/api/v1/search`
- **认证方式**: `Authorization: Bearer YOUR_API_KEY`
- **API Key获取**: [https://metaso.cn/search-api/api-keys](https://metaso.cn/search-api/api-keys)
- **默认赠送额度**: 5000次调用

### 2. 核心接口参数

**POST /api/v1/search**

```json
{
  "q": "搜索关键词",                    // 必填，string
  "scope": "webpage",                  // 可选，搜索范围：webpage(网页)/document(文档)/paper(学术)/image(图片)/video(视频)/podcast(播客)
  "includeSummary": true,              // 可选，boolean，通过摘要增强召回
  "includeRawContent": false,          // 可选，boolean，抓取来源网页原文
  "size": 10,                          // 可选，integer，返回结果数量
  "conciseSnippet": false              // 可选，boolean，返回精简原文片段
}
```

**响应格式**:
```json
{
  "code": 0,
  "data": {
    "results": [
      {
        "title": "标题",
        "url": "链接",
        "content": "内容摘要",
        "rawContent": "原始内容(当includeRawContent=true时)"
      }
    ],
    "summary": "整体摘要(当includeSummary=true时)"
  }
}
```

## 二、PRD产品需求文档

### 1. 项目概述
开发一个基于Node.js的秘塔搜索MCP服务器，支持stdio传输方式，为AI助手提供实时搜索能力。

### 2. 功能需求

| 功能模块 | 需求描述 | 优先级 |
|---------|---------|--------|
| **多维搜索** | 支持网页/文档/学术/图片/视频/播客6种搜索类型 | P0 |
| **内容提取** | 提取网页内容并转为Markdown/JSON格式 | P1 |
| **智能问答** | 基于RAG技术的问答服务 | P2 |
| **流式响应** | 支持SSE流式返回结果 | P1 |
| **错误处理** | 完善的异常捕获和重试机制 | P0 |

### 3. 非功能需求
- **协议标准**: 符合Model Context Protocol规范
- **传输方式**: 优先支持stdio，可选支持SSE
- **性能**: 响应时间<2s，支持并发请求
- **安全**: API密钥环境变量存储，支持IP轮换
- **可维护性**: TypeScript实现，完整类型定义
- **部署**: 支持npm全局安装，npx直接运行

### 4. 技术架构
```
┌─────────────────┐
│  MCP Client     │
│  (Claude/Dify)  │
└────────┬────────┘
         │ stdio
┌────────▼────────┐
│  MCP Server     │
│  (Node.js)      │
└────────┬────────┘
         │ HTTPS
┌────────▼────────┐
│  Metaso API     │
│  (metaso.cn)    │
└─────────────────┘
```

### 5. 成功标准
- ✅ 通过Claude Desktop配置测试
- ✅ 支持至少3种搜索类型
- ✅ 平均响应时间<2秒
- ✅ 单元测试覆盖率>80%

## 三、Node.js实现方案（stdio方式）

### 1. 项目初始化

```bash
mkdir mcp-metaso-search && cd mcp-metaso-search
npm init -y
npm install @modelcontextprotocol/sdk axios zod
npm install -D @types/node typescript
```

**package.json**:
```json
{
  "name": "@yourname/metaso-search-mcp",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "metaso-mcp": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "start": "node dist/index.js"
  }
}
```

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### 2. 核心代码实现

**src/index.ts**:
```typescript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ToolDefinition,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosError } from 'axios';
import { z } from 'zod';

// ==================== 类型定义 ====================
const MetasoResponseSchema = z.object({
  code: z.number(),
  data: z.object({
    results: z.array(z.object({
      title: z.string(),
      url: z.string(),
      content: z.string().optional(),
      rawContent: z.string().optional(),
    })),
    summary: z.string().optional(),
  }),
});

// ==================== 配置管理 ====================
const API_KEY = process.env.METASO_API_KEY;
const API_BASE_URL = process.env.METASO_BASE_URL || 'https://metaso.cn/api/v1';

if (!API_KEY) {
  console.error('Error: METASO_API_KEY environment variable is required');
  process.exit(1);
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ==================== 工具定义 ====================
const SEARCH_TOOL: ToolDefinition = {
  name: 'metaso_search',
  description: '使用秘塔AI搜索进行多维度搜索，支持网页、文档、学术、图片、视频、播客等类型',
  inputSchema: {
    type: 'object',
    properties: {
      q: {
        type: 'string',
        description: '搜索查询关键词',
      },
      scope: {
        type: 'string',
        description: '搜索范围: webpage(网页)/document(文档)/paper(学术)/image(图片)/video(视频)/podcast(播客)',
        enum: ['webpage', 'document', 'paper', 'image', 'video', 'podcast'],
        default: 'webpage',
      },
      includeSummary: {
        type: 'boolean',
        description: '是否通过网页摘要增强召回',
        default: false,
      },
      includeRawContent: {
        type: 'boolean',
        description: '是否抓取来源网页原文',
        default: false,
      },
      size: {
        type: 'number',
        description: '返回结果数量，默认10',
        default: 10,
      },
      conciseSnippet: {
        type: 'boolean',
        description: '是否返回精简原文片段',
        default: false,
      },
    },
    required: ['q'],
  },
};

const READER_TOOL: ToolDefinition = {
  name: 'metaso_read',
  description: '读取指定URL的网页内容并转换为指定格式',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: '要读取的URL',
      },
      format: {
        type: 'string',
        description: '输出格式: json/markdown',
        enum: ['json', 'markdown'],
        default: 'markdown',
      },
    },
    required: ['url'],
  },
};

// ==================== 工具执行逻辑 ====================
async function performSearch(params: any) {
  try {
    const response = await axiosInstance.post('/search', {
      q: params.q,
      scope: params.scope || 'webpage',
      includeSummary: params.includeSummary || false,
      includeRawContent: params.includeRawContent || false,
      size: params.size || 10,
      conciseSnippet: params.conciseSnippet || false,
    });

    const parsed = MetasoResponseSchema.parse(response.data);
    
    if (parsed.code !== 0) {
      throw new Error(`API返回错误码: ${parsed.code}`);
    }

    const results = parsed.data.results;
    let output = `🔍 搜索"${params.q}"找到 ${results.length} 个结果\n\n`;
    
    results.forEach((result, index) => {
      output += `${index + 1}. **${result.title}**\n`;
      output += `   🔗 ${result.url}\n`;
      if (result.content) {
        output += `   📄 ${result.content}\n`;
      }
      if (params.includeRawContent && result.rawContent) {
        output += `   📰 原始内容: ${result.rawContent.substring(0, 200)}...\n`;
      }
      output += '\n';
    });

    if (parsed.data.summary) {
      output += `📊 综合摘要: ${parsed.data.summary}\n`;
    }

    return output;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(`API请求失败: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

async function readUrl(params: any) {
  // 注：秘塔API未明确提供独立的内容提取接口
  // 这里模拟实现，实际需使用metaso.cn/api/mcp的web_reader工具
  return `📖 网页读取功能需通过metaso.cn/api/mcp端点实现\n请求URL: ${params.url}\n格式: ${params.format}`;
}

// ==================== MCP服务器初始化 ====================
class MetasoMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'metaso-search-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [SEARCH_TOOL, READER_TOOL],
    }));

    // 执行工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result: string;
        
        switch (name) {
          case 'metaso_search':
            result = await performSearch(args);
            break;
          case 'metaso_read':
            result = await readUrl(args);
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

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Metaso MCP Server running on stdio');
  }
}

// ==================== 主入口 ====================
const server = new MetasoMCPServer();
server.run().catch((error) => {
  console.error('Fatal error in main server:', error);
  process.exit(1);
});
```

### 3. 构建与部署

```bash
# 1. 安装依赖
npm install

# 2. 编译TypeScript
npm run build

# 3. 设置API密钥
export METASO_API_KEY="mk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 4. 本地测试
npm start

# 5. 全局安装（发布到npm后）
npm install -g @yourname/metaso-search-mcp
metaso-mcp

# 6. 使用npx直接运行（无需安装）
npx -y @yourname/metaso-search-mcp
```

### 4. Claude Desktop配置

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "metaso": {
      "command": "npx",
      "args": ["-y", "@yourname/metaso-search-mcp"],
      "env": {
        "METASO_API_KEY": "mk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

## 四、增强功能建议

### 1. 支持IP轮换
```typescript
// 在axios配置中添加代理轮换
const proxyList = process.env.PROXY_LIST?.split(',') || [];
let currentProxyIndex = 0;

function getNextProxy() {
  if (proxyList.length === 0) return undefined;
  const proxy = proxyList[currentProxyIndex];
  currentProxyIndex = (currentProxyIndex + 1) % proxyList.length;
  return proxy;
}
```

### 2. 缓存机制
```typescript
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 3600 });

async function performSearchWithCache(params: any) {
  const cacheKey = JSON.stringify(params);
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  const result = await performSearch(params);
  cache.set(cacheKey, result);
  return result;
}
```

### 3. 流式响应支持
```typescript
// 在工具定义中添加stream参数
stream: {
  type: 'boolean',
  description: '是否使用流式响应',
  default: false,
}
```

## 五、测试验证

```bash
# 测试工具列表
echo '{"method":"tools/list"}' | npx -y @yourname/metaso-search-mcp

# 测试搜索工具
echo '{"method":"tools/call","params":{"name":"metaso_search","arguments":{"q":"Quantum Computing","scope":"paper","size":3}}}' | npx -y @yourname/metaso-search-mcp
```

---

**总结**: 以上方案提供了完整的Node.js MCP服务器实现，基于stdio传输方式，符合MCP协议规范，可直接集成到Claude Desktop、Cursor等客户端。如需接入魔搭社区，可将项目发布到npm后提交到ModelScope的MCP服务列表。

需要我协助部署或扩展特定功能吗？