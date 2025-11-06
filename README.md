# AssemblyScript iZEBOT Meta-Language Pseudo-Compiler

A small AssemblyScript-based pseudo-compiler for a BNF meta-language that generates PBASIC programs for the iZEBOT (Robo-Stamp 2P).

This repository contains a lexer, parser (with leftmost derivation logging), parse-tree renderer, and a generator that emits a PBASIC program saved as `output/IZEBOT.BSP`.

## Quick start — view the web UI

The project includes a simple web view. From the repository root you can serve the folder and open the UI in your browser. For example:

```pwsh
# from repository root (Windows PowerShell)
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

## CLI

There are convenient npm scripts defined in `package.json` to run and build the project:

- `npm run dev` — run the host in development (uses `ts-node` to run `host/main.ts`). This is the easiest way to run the interactive REPL/host locally.
- `npm run build` — build the AssemblyScript WebAssembly module and host TypeScript (runs `build:wasm` and `build:host`).
- `npm run start` — run the built host (`node dist/host/main.js`).
- `npm run clean` — remove build artifacts and `output/` files.

Example (PowerShell):

```pwsh
npm run dev
```

When you run the generator via the host (development or built host), the produced PBASIC program is written to `output/IZEBOT.BSP`.

## What you'll find here

- `assembly/src/` — AssemblyScript source: lexer, parser, derivation logger, tree renderer, and code generator.
- `output/IZEBOT.BSP` — Example generated PBASIC output (overwritten by the generator).
- `tests/` — Test harnesses for project behavior.

## Notes

- The compiler expects the exact case-sensitive tokens defined by the BNF (e.g., `EXEC`, `HALT`, `key`, movement mnemonics). See the `assembly/src/analysis` sources for the precise grammar and error handling.
- Generated PBASIC follows the templates in `assembly/src/generator/pbasicBlocks.ts` and will include only the movement subroutines referenced by the input.
