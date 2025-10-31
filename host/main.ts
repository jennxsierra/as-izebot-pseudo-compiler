// host/main.ts
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { writeFile } from "node:fs/promises";
import { loadWasm } from "./wasm.js";

async function pause(rl: readline.Interface) {
  await rl.question("Press Enter to continue...");
}

async function run() {
  const rl = readline.createInterface({ input, output });
  const as = await loadWasm();

  // 1) Show grammar
  console.log("\nGrammar:\n");
  console.log(as.__getString(as.showGrammar()));

  while (true) {
    const s = await rl.question("\nEnter input (or QUIT): ");
    if (s.trim().toUpperCase() === "QUIT") break;

    // 2) Compile via WASM: string → pointer, pointer → string
    const ptr = as.__newString(s);
    const resPtr = as.compile(ptr);
    const json = as.__getString(resPtr);

    // 3) Display sections
    type Result = {
      grammar: string;
      derivationSteps: string[];
      parseTreeAscii: string;
      pbasic: string;
    };
    let result: Result;
    try {
      result = JSON.parse(json);
    } catch (e) {
      console.error("Compiler returned malformed JSON:", json);
      continue;
    }

    console.log("\nLeftmost derivation steps:\n");
    result.derivationSteps.forEach((line, i) =>
      console.log(`${i + 1}. ${line}`)
    );
    await pause(rl);

    console.log("\nParse tree:\n");
    console.log(result.parseTreeAscii);
    await pause(rl);

    console.log("\nGenerated PBASIC:\n");
    console.log(result.pbasic);

    const save = await rl.question("\nSave as IZEBOT.BSP? (y/n): ");
    if (save.trim().toLowerCase().startsWith("y")) {
      await writeFile("IZEBOT.BSP", result.pbasic, "utf8");
      console.log("Saved IZEBOT.BSP");
    }
  }

  rl.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
