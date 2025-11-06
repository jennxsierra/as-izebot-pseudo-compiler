import { readFile } from 'fs/promises';
import { instantiate, ASUtil } from '@assemblyscript/loader';

export async function loadWasm() {
  const wasmBuffer = await readFile('./build/release.wasm');
  const imports: any = {
    env: {
      abort(msg: number, file: number, line: number, column: number) {
        console.error('Abort called');
      },
      seed(): number {
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

export type WasmModule = Awaited<ReturnType<typeof loadWasm>>;

