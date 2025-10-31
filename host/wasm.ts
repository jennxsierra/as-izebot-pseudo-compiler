// host/wasm.ts
import { readFile } from "node:fs/promises";
import { instantiate } from "@assemblyscript/loader";

type Loader = {
  memory: WebAssembly.Memory;
  __newString: (s: string) => number;
  __getString: (ptr: number) => string;
  compile: (ptr: number) => number;     // string in → string out
  showGrammar: () => number;            // string out
};

export async function loadWasm() {
  const wasm = await readFile("build/release.wasm");
  const { exports } = await instantiate<Loader>(wasm, {});
  return exports;
}
