// WASM loader for the host CLI.
// Responsibilities:
// - Read the compiled WebAssembly binary produced by the AssemblyScript build
// - Provide minimal imports required by the module so it can instantiate
// - Return the instantiated module object to the caller
import { readFile } from 'fs/promises';
import { instantiate, ASUtil } from '@assemblyscript/loader';

export async function loadWasm() {
  // Read the compiled wasm binary from the build output
  const wasmBuffer = await readFile('./build/release.wasm');

  // Minimal import object: the AssemblyScript runtime expects a few env
  // functions (abort/seed) and sometimes console bindings. We provide
  // small stubs here so the module can initialize; the host handles
  // actual logging/translation of strings later when necessary.
  const imports: any = {
    env: {
      abort(msg: number, file: number, line: number, column: number) {
        // AssemblyScript calls this on unrecoverable errors. Keep a simple
        // message so the host can diagnose crashes during development.
        console.error('Abort called');
      },
      seed(): number {
        // Provide a simple seed implementation for any random needs.
        return Date.now();
      },
      // AssemblyScript may import console functions as env['console.error'] etc.
      // Provide minimal no-op wrappers that accept a pointer (i32) so instantiation succeeds.
      'console.error': (ptr: number): void => {
        // no-op in the loader as string marshalling isn't available at this stage
      }
    }
  };

  const module = await instantiate(wasmBuffer, imports);

  return module;
}

// Helper type: the loader returns a module with exports; useful for callers/tests
export type WasmModule = Awaited<ReturnType<typeof loadWasm>>;

