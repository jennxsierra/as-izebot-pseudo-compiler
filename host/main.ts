import * as readline from 'readline';
import { loadWasm } from './wasm.js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

let wasm: any;

async function initialize() {
  console.log('Loading WASM module...');
  const module = await loadWasm();
  wasm = module.exports;
  console.log('WASM module loaded successfully!\n');
}

function displayGrammar() {
  console.log('BNF Grammar:');
  console.log('<program> -> EXEC <stmt_list> HALT');
  console.log('<stmt_list> -> <binding> > | <binding> > <stmt_list>');
  console.log('<binding> -> <key> = <move>');
  console.log('<key> -> key <key_id>');
  console.log('<key_id> -> A | B | C | D');
  console.log('<move> -> DRVF | DRVB | TRNL | TRNR | SPNL | SPNR');
  console.log('');
}

async function mainLoop() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  const pause = (): Promise<void> => {
    return new Promise((resolve) => {
      rl.question('\nPress Enter to continue...', () => {
        resolve();
      });
    });
  };

  while (true) {
  // console.clear();
    displayGrammar();
    
    const input = await question('Enter a sentence (or QUIT to exit): ');
    
    if (input.trim() === 'QUIT') {
      console.log('\nExiting...');
      rl.close();
      break;
    }

    console.log('\n=== Processing Input ===\n');

    // Call the WASM compile function with manual string marshalling
    const inputPtr = wasm.__newString(input);
    const resultPtr = wasm.compile(inputPtr);
    const result = wasm.__getString(resultPtr);

    if (result.startsWith('ERROR:')) {
      const errorMsg = result.substring(6);
      console.error(errorMsg);
      console.log('\nInvalid sentence of the meta-language');
      await pause();
      continue;
    }

    // Parse the result
    const lines = result.split('\n');
    let section = '';
    let derivation = '';
    let tree = '';
    let code = '';

    for (const line of lines) {
      if (line === 'SUCCESS') continue;
      if (line === 'DERIVATION_START') {
        section = 'derivation';
        continue;
      }
      if (line === 'DERIVATION_END') {
        section = '';
        continue;
      }
      if (line === 'TREE_START') {
        section = 'tree';
        continue;
      }
      if (line === 'TREE_END') {
        section = '';
        continue;
      }
      if (line === 'CODE_START') {
        section = 'code';
        continue;
      }
      if (line === 'CODE_END') {
        section = '';
        continue;
      }

      if (section === 'derivation') {
        derivation += line + '\n';
      } else if (section === 'tree') {
        tree += line + '\n';
      } else if (section === 'code') {
        code += line + '\n';
      }
    }

    // Display derivation
    console.log('Leftmost Derivation:');
    console.log(derivation);
    console.log('Derivation successful!\n');
    await pause();

    // Display parse tree
    console.log('\n=== Parse Tree ===\n');
    console.log(tree);
    await pause();

    // Display and save PBASIC code
    console.log('\n=== Generated PBASIC Code ===\n');
    console.log(code);

    // Save to file
    try {
      const outputDir = join(process.cwd(), 'output');
      await mkdir(outputDir, { recursive: true });
      const outputPath = join(outputDir, 'IZEBOT.BSP');
      await writeFile(outputPath, code, 'utf-8');
      console.log(`\nPBASIC code saved to: ${outputPath}`);
    } catch (error) {
      console.error('Error saving file:', error);
    }

    await pause();
  }
}

async function main() {
  try {
    await initialize();
    await mainLoop();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
