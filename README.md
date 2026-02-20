# Metaso Search MCP Server | 秘塔搜索 MCP 服务器

MCP server for Metaso Search API, providing search and web reader tools over stdio.

基于秘塔搜索 API 的 MCP 服务器，通过 stdio 提供搜索与网页读取能力。

## Features | 功能

- `metaso_search`: multi-scope search (`webpage`, `document`, `paper`, `image`, `video`, `podcast`)
- `metaso_reader`: read webpage content in `markdown` or `json`
- npm-ready package with CI/CD publish workflow
- `npx` config generator for Cherry Studio / Cursor / Claude / generic MCP clients

## Install | 安装

### From npm (recommended) | npm 安装（推荐）

```bash
npm install -g metaso-search-mcp
```

### From source | 源码安装

```bash
git clone https://github.com/SecretRichGarden/metasota-API-MCP.git
cd metasota-API-MCP
npm install
npm run build
```

## MCP stdio Config | MCP 标准配置

ModelScope/Smithery style (`command: npx`, `args: [package]`):

```json
{
  "mcpServers": {
    "metaso-search-mcp": {
      "command": "npx",
      "args": ["metaso-search-mcp"],
      "env": {
        "METASO_API_KEY": "mk-你的API密钥"
      }
    }
  }
}
```

## One-command Config Generator | 一键生成配置

Print config JSON:

```bash
npx -y -p metaso-search-mcp metaso-mcp-config --client generic --api-key mk-你的API密钥 --print
```

Write/merge into a target config file:

```bash
npx -y -p metaso-search-mcp metaso-mcp-config --client cherry --api-key mk-你的API密钥 --output ./mcp-config.json
```

Notes:
- `--output` will merge into existing `mcpServers` instead of overwriting all servers.
- Default server key is `metaso-search-mcp`; change with `--server-name`.

## API Key & Env Parameters | API Key 与环境变量

Required | 必填:

- `METASO_API_KEY`: Metaso API key / 秘塔 API 密钥

Optional | 可选:

- `METASO_BASE_URL` (default: `https://metaso.cn/api/v1`)
- `METASO_TIMEOUT` (default: `60000`)
- `METASO_DEFAULT_SEARCH_SCOPE` (`webpage|document|paper|image|video|podcast`)
- `METASO_DEFAULT_SEARCH_SIZE` (`1-100`, default `10`)
- `METASO_DEFAULT_INCLUDE_SUMMARY` (`true|false`)
- `METASO_DEFAULT_INCLUDE_RAW_CONTENT` (`true|false`)
- `METASO_DEFAULT_CONCISE_SNIPPET` (`true|false`)
- `METASO_DEFAULT_READER_FORMAT` (`markdown|json`)

Local env setup:

```bash
cp .env.example .env
# then edit .env and fill METASO_API_KEY
```

## npm Scripts | 脚本

```bash
npm run typecheck
npm run build
npm run rebuild
npm run release:check
npm run pack:dry
npm run pack:local
```

## Auto Publish to npm (GitHub Actions) | 自动发布 npm

Workflow: `.github/workflows/release-npm.yml`

1. Add repository secret `NPM_TOKEN` in GitHub Actions secrets.
2. Push a version tag:

```bash
git tag v1.0.1
git push origin v1.0.1
```

## Platform Publishing Docs | 平台发布文档

See `docs/PLATFORM_PUBLISHING.md` for:

- Smithery submission checklist
- ModelScope (魔塔社区) submission checklist
- npx stdio config snippet for platform pages

## License

MIT
