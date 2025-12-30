# 秘塔搜索 MCP 服务器

基于 Model Context Protocol (MCP) 的秘塔搜索 API 服务器，为 AI 助手提供实时搜索和网页读取能力。

## ✨ 功能特性

### 🔍 多维搜索 (`metaso_search`)

支持6种搜索范围：
- **webpage**: 网页搜索（默认）
- **document**: 文库搜索
- **paper**: 学术论文搜索
- **image**: 图片搜索
- **video**: 视频搜索
- **podcast**: 播客/博客搜索

高级功能：
- `includeSummary`: 通过网页摘要增强召回
- `includeRawContent`: 抓取来源网页原文
- `conciseSnippet`: 返回精简的原文匹配信息

### 📖 网页读取 (`metaso_reader`)

读取任意URL网页内容，支持两种输出格式：
- **markdown**: 返回 Markdown 格式（默认）
- **json**: 返回 JSON 结构化数据

## 📦 安装

### 方式一：从源码安装

```bash
# 克隆项目
git clone https://github.com/SecretRichGarden/metasota-API-MCP.git
cd metasota-API-MCP

# 安装依赖
npm install

# 编译 TypeScript
npm run build

# 启动项目（本地挂服务的话跑这个）
npm start
```

### 方式二：全局安装（发布后）

```bash
npm install -g metaso-search-mcp
```

## ⚙️ 配置

### 1. 获取 API Key

访问 [秘塔搜索 API 管理页面](https://metaso.cn/search-api/api-keys) 获取您的 API Key。

### 2. 配置方式

#### 方式一：使用 .env 文件（推荐，适用于本地开发）

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入您的 API Key 和其他配置
# 项目已集成 dotenv，会自动加载 .env 文件中的配置
```

#### 方式二：直接设置环境变量

```bash
# Windows (PowerShell)
$env:METASO_API_KEY = "mk-你的API密钥"

# Windows (CMD)
set METASO_API_KEY=mk-你的API密钥

# macOS/Linux
export METASO_API_KEY="mk-你的API密钥"
```

### 3. 环境变量配置

所有配置都可以通过环境变量设置，支持以下两种方式：

#### 方式一：在 MCP 配置文件中设置（推荐）

在 Claude Desktop 或 Cursor 的 MCP 配置文件中，可以直接在 `env` 字段中设置所有环境变量。

#### 方式二：使用 .env 文件（本地开发）

项目根目录下创建 `.env` 文件（可参考 `.env.example`）：

```bash
# 复制模板文件
cp .env.example .env
# 然后编辑 .env 文件填入实际值
```

#### 完整环境变量列表

**必需配置：**
- `METASO_API_KEY` (string, 必填) - 秘塔搜索 API 密钥

**API 配置：**
- `METASO_BASE_URL` (string, 可选) - API 基础端点，默认: `https://metaso.cn/api/v1`
- `METASO_TIMEOUT` (number, 可选) - API 请求超时时间（毫秒），默认: `60000` (60秒)

**搜索默认配置：**
- `METASO_DEFAULT_SEARCH_SCOPE` (string, 可选) - 默认搜索范围，默认: `webpage`
  - 可选值: `webpage`, `document`, `paper`, `image`, `video`, `podcast`
- `METASO_DEFAULT_SEARCH_SIZE` (number, 可选) - 默认搜索结果数量，默认: `10`，范围: `1-100`
- `METASO_DEFAULT_INCLUDE_SUMMARY` (boolean, 可选) - 默认是否通过网页摘要增强召回，默认: `false`
- `METASO_DEFAULT_INCLUDE_RAW_CONTENT` (boolean, 可选) - 默认是否抓取所有来源网页原文，默认: `false`
- `METASO_DEFAULT_CONCISE_SNIPPET` (boolean, 可选) - 默认是否返回精简的原文匹配信息，默认: `false`

**网页读取默认配置：**
- `METASO_DEFAULT_READER_FORMAT` (string, 可选) - 默认网页读取输出格式，默认: `markdown`
  - 可选值: `markdown`, `json`

## 🚀 使用方法

### 本地运行

```bash
npm start
```

### 与 Claude Desktop 集成

编辑 Claude Desktop 配置文件：

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

**最小配置（仅 API Key）：**
```json
{
  "mcpServers": {
    "metaso": {
      "command": "node",
      "args": ["C:/path/to/metaso-search-mcp/dist/index.js"],
      "env": {
        "METASO_API_KEY": "mk-你的API密钥"
      }
    }
  }
}
```

**完整配置示例（包含所有可选配置）：**
```json
{
  "mcpServers": {
    "metaso": {
      "command": "node",
      "args": ["C:/path/to/metaso-search-mcp/dist/index.js"],
      "env": {
        "METASO_API_KEY": "mk-你的API密钥",
        "METASO_BASE_URL": "https://metaso.cn/api/v1",
        "METASO_TIMEOUT": "60000",
        "METASO_DEFAULT_SEARCH_SCOPE": "webpage",
        "METASO_DEFAULT_SEARCH_SIZE": "10",
        "METASO_DEFAULT_INCLUDE_SUMMARY": "false",
        "METASO_DEFAULT_INCLUDE_RAW_CONTENT": "false",
        "METASO_DEFAULT_CONCISE_SNIPPET": "false",
        "METASO_DEFAULT_READER_FORMAT": "markdown"
      }
    }
  }
}
```

### 与 Cursor 或 Cherry Studio 集成

在 Cursor 或 Cherry Studio 的 MCP 配置中添加：

**最小配置（仅 API Key）：**
```json
{
  "mcpServers": {
    "metaso": {
      "command": "node",
      "args": ["C:/path/to/metaso-search-mcp/dist/index.js"],
      "env": {
        "METASO_API_KEY": "mk-你的API密钥"
      }
    }
  }
}
```

**完整配置示例（包含所有可选配置）：**
```json
{
  "mcpServers": {
    "metaso": {
      "command": "node",
      "args": ["C:/path/to/metaso-search-mcp/dist/index.js"],
      "env": {
        "METASO_API_KEY": "mk-你的API密钥",
        "METASO_BASE_URL": "https://metaso.cn/api/v1",
        "METASO_TIMEOUT": "60000",
        "METASO_DEFAULT_SEARCH_SCOPE": "webpage",
        "METASO_DEFAULT_SEARCH_SIZE": "10",
        "METASO_DEFAULT_INCLUDE_SUMMARY": "false",
        "METASO_DEFAULT_INCLUDE_RAW_CONTENT": "false",
        "METASO_DEFAULT_CONCISE_SNIPPET": "false",
        "METASO_DEFAULT_READER_FORMAT": "markdown"
      }
    }
  }
}
```

**配置说明：**
- 所有环境变量都是可选的（除了 `METASO_API_KEY`）
- 在 JSON 配置中，布尔值需要用字符串 `"true"` 或 `"false"` 表示
- 数字值也需要用字符串表示，如 `"60000"`、`"10"`
- 可以根据需要只配置部分环境变量，未配置的将使用默认值

## 📚 工具使用示例

### 搜索示例

```typescript
// 基础网页搜索
metaso_search({ q: "人工智能最新进展" })

// 学术论文搜索，返回20条结果
metaso_search({
  q: "深度学习",
  scope: "paper",
  size: 20,
  includeSummary: true
})

// 搜索并获取原文内容
metaso_search({
  q: "量子计算",
  includeRawContent: true,
  conciseSnippet: true
})
```

### 网页读取示例

```typescript
// 读取网页，返回 Markdown
metaso_reader({
  url: "https://example.com/article"
})

// 读取网页，返回 JSON
metaso_reader({
  url: "https://example.com/article",
  format: "json"
})
```

## 📋 API 参考

### metaso_search

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| q | string | ✅ | - | 搜索关键词 |
| scope | string | ❌ | webpage | 搜索范围 |
| includeSummary | boolean | ❌ | false | 是否返回综合摘要 |
| includeRawContent | boolean | ❌ | false | 是否获取原文 |
| size | number | ❌ | 10 | 结果数量 (1-100) |
| conciseSnippet | boolean | ❌ | false | 是否精简匹配 |

### metaso_reader

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| url | string | ✅ | - | 网页URL |
| format | string | ❌ | markdown | 输出格式 |

## 🔧 开发

```bash
# 开发模式（监听文件变化）
npm run dev

# 构建
npm run build

# 清理构建产物
npm run clean
```

## 📄 许可证

MIT License

## 🔗 相关链接

- [秘塔搜索](https://metaso.cn/)
- [秘塔 API 文档](https://metaso.cn/search-api/api-keys)
- [Model Context Protocol](https://modelcontextprotocol.io/)

