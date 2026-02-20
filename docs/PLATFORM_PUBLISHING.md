# MCP 平台发布指南 / MCP Platform Publishing Guide

## 1) npm 自动发布（GitHub Actions）

1. 在 npm 创建 Access Token（建议 `Automation` 类型，权限至少可发布该包）。
2. 打开 GitHub 仓库 `Settings -> Secrets and variables -> Actions`。
3. 新建仓库 Secret：`NPM_TOKEN`，值为你的 npm token。
4. 推送标签触发发布：

```bash
git tag v1.0.1
git push origin v1.0.1
```

工作流文件：`.github/workflows/release-npm.yml`

## 2) 生成 stdio MCP 配置（npx 一键）

目标格式与 ModelScope 示例一致（`command: npx` + `args: [包名]`），并默认带 `METASO_API_KEY`：

```bash
npx -y -p metaso-search-mcp metaso-mcp-config --client cherry --api-key mk-你的API密钥 --output ./mcp-config.json
```

你也可以只打印到终端：

```bash
npx -y -p metaso-search-mcp metaso-mcp-config --client generic --api-key mk-你的API密钥 --print
```

## 3) 提交到 Smithery / 魔塔社区（ModelScope MCP）

建议准备以下材料：
- npm 包名：`metaso-search-mcp`
- GitHub 仓库地址
- README（中英双语，含 API Key 配置）
- MCP 配置示例（stdio）
- 功能说明：`metaso_search`、`metaso_reader`

推荐在平台展示的配置示例：

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

## 4) English Quick Summary

1. Add `NPM_TOKEN` in GitHub Actions secrets.
2. Tag and push (e.g. `v1.0.1`) to trigger npm publish.
3. Generate MCP stdio config using:

```bash
npx -y -p metaso-search-mcp metaso-mcp-config --client cherry --api-key mk-your-key --output ./mcp-config.json
```

4. Submit npm package + GitHub repo + stdio config snippet to Smithery and ModelScope MCP.
