# Metaso Search MCP Server

## Project Overview
This project is a **Model Context Protocol (MCP) Server** for Metaso Search (秘塔搜索). It enables AI assistants (like Claude, Cursor) to perform real-time web searches, read web pages, and conduct intelligent Q&A using Metaso's API.

**Key Technologies:**
*   **Language:** TypeScript
*   **Runtime:** Node.js
*   **Framework:** `@modelcontextprotocol/sdk`
*   **HTTP Client:** `axios`
*   **Validation:** `zod`

## Architecture
The server exposes three main tools:
1.  `metaso_search`: Multi-dimensional search (webpage, document, paper, image, video, podcast).
2.  `metaso_reader`: Reads and parses web page content (Markdown/JSON).
3.  `metaso_chat`: Intelligent Q&A using models like `ds-r1` (DeepSeek-R1), `fast`, and `fast_thinking`.

The entry point is `src/index.ts`, which sets up the MCP server, validates environment variables, and handles tool execution.

## Building and Running

### Prerequisites
*   Node.js (>=18.0.0)
*   NPM

### Key Commands
*   **Install Dependencies:** `npm install`
*   **Build:** `npm run build` (Runs `tsc`)
*   **Development:** `npm run dev` (Runs `tsc --watch`)
*   **Start:** `npm start` (Runs `node dist/index.js`)
*   **Clean:** `npm run clean`

## Configuration
The server requires environment variables to function:
*   `METASO_API_KEY`: (Required) Your Metaso API Key.
*   `METASO_BASE_URL`: (Optional) API base URL (default: `https://metaso.cn/api/v1`).
*   `METASO_DEFAULT_MODEL`: (Optional) Default QA model (default: `ds-r1`).

## Development Conventions
*   **Code Style:** TypeScript strict mode is likely enabled (inferred from standard MCP templates).
*   **Error Handling:** Custom error handling for Axios requests and tool execution.
*   **Input Validation:** Uses Zod schemas for all tool inputs and API responses.