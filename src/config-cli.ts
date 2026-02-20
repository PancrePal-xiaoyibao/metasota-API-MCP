#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

interface CliOptions {
  apiKey: string;
  client: string;
  output?: string;
  serverName: string;
  printOnly: boolean;
  withEnv: boolean;
}

const DEFAULT_API_KEY_PLACEHOLDER = "mk-你的API密钥";

function printHelp(): void {
  console.log(`metaso-mcp-config

Usage:
  metaso-mcp-config --client <name> [--api-key <key>] [--no-env] [--output <path>] [--server-name <name>] [--print]

Options:
  --client       Client label for metadata only (claude/cursor/cherry/generic)
  --api-key      Metaso API key. Default: ${DEFAULT_API_KEY_PLACEHOLDER}
  --no-env       Do not include env.METASO_API_KEY in generated config
  --output       Write merged JSON config to target path
  --server-name  MCP server key in mcpServers. Default: metaso
  --print        Print JSON to stdout (default behavior when --output is omitted)
  --help         Show this help
`);
}

function parseArgs(argv: string[]): CliOptions {
  if (argv.includes("--help") || argv.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  let client = "generic";
  let apiKey = DEFAULT_API_KEY_PLACEHOLDER;
  let output: string | undefined;
  let serverName = "metaso-search-mcp";
  let printOnly = false;
  let withEnv = true;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === "--client" && next) {
      client = next.trim().toLowerCase();
      i += 1;
      continue;
    }
    if (arg === "--api-key" && next) {
      apiKey = next.trim();
      i += 1;
      continue;
    }
    if (arg === "--output" && next) {
      output = next.trim();
      i += 1;
      continue;
    }
    if (arg === "--server-name" && next) {
      serverName = next.trim();
      i += 1;
      continue;
    }
    if (arg === "--print") {
      printOnly = true;
      continue;
    }
    if (arg === "--no-env") {
      withEnv = false;
      continue;
    }
  }

  return { apiKey, client, output, serverName, printOnly, withEnv };
}

function buildConfig(options: CliOptions): Record<string, unknown> {
  const serverConfig: Record<string, unknown> = {
    command: "npx",
    args: ["metaso-search-mcp"],
  };

  if (options.withEnv) {
    serverConfig.env = {
      METASO_API_KEY: options.apiKey,
    };
  }

  return {
    mcpServers: {
      [options.serverName]: serverConfig,
    },
  };
}

function mergeConfig(existing: Record<string, unknown>, next: Record<string, unknown>): Record<string, unknown> {
  const existingServers = (existing.mcpServers ?? {}) as Record<string, unknown>;
  const nextServers = (next.mcpServers ?? {}) as Record<string, unknown>;

  return {
    ...existing,
    mcpServers: {
      ...existingServers,
      ...nextServers,
    },
  };
}

async function writeMergedConfig(outputPath: string, generated: Record<string, unknown>): Promise<void> {
  const abs = resolve(outputPath);
  const dir = dirname(abs);
  await mkdir(dir, { recursive: true });

  let merged = generated;
  try {
    const existing = await readFile(abs, "utf8");
    merged = mergeConfig(JSON.parse(existing) as Record<string, unknown>, generated);
  } catch {
    merged = generated;
  }

  await writeFile(abs, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  console.log(`Config written: ${abs}`);
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const generated = buildConfig(options);

  if (options.output) {
    await writeMergedConfig(options.output, generated);
    if (options.printOnly) {
      console.log(JSON.stringify(generated, null, 2));
    }
    return;
  }

  console.log(JSON.stringify(generated, null, 2));
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`metaso-mcp-config failed: ${message}`);
  process.exit(1);
});
