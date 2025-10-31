import { readFile } from 'fs/promises';
import { instantiate, ASUtil } from '@assemblyscript/loader';

export async function loadWasm() {
  const wasmBuffer = await readFile('./build/release.wasm');
  const module = await instantiate(wasmBuffer, {
    env: {
      abort(msg: number, file: number, line: number, column: number) {
        console.error('Abort called');
      },
      seed(): number {
        return Date.now();
      }
    }
  });

  return module;
}

export type WasmModule = Awaited<ReturnType<typeof loadWasm>>;

