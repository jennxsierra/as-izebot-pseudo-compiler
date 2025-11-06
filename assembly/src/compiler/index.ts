import { Lexer } from '../analysis/lexer';
import { Parser } from '../analysis/parser';
import { TreeRenderer } from '../analysis/tree';
import { CodeGenerator } from '../generator/intermediateCode';

// Exported functions for WASM interface
export function compile(input: string): string {
  // Step 1: Lexical analysis
  let lexer = new Lexer(input);
  let tokens = lexer.tokenize();
  
  // Step 2: Parse and derive
  let parser = new Parser(tokens);
  let parseResult = parser.parse();

  if (parseResult == null) {
    let error = parser.getErrorMessage();
    if (error.length == 0) {
      error = 'Unknown parsing error';
    }
    return 'ERROR:' + error;
  }
  
  // Step 3: Get results
  let derivation = parser.getDerivation();
  let symbolMap = parser.getSymbolMap();
  let parseTree = parser.getParseTree();
  
  // Step 4: Generate PBASIC code
  let generator = new CodeGenerator(symbolMap);
  let pbasicCode = generator.generate();
  
  // Return all results as a formatted string
  let result = 'SUCCESS\n';
  
  // Add derivation
  result += 'DERIVATION_START\n';
  let steps = derivation.getSteps();
  let lineNumber = 1;
  for (let i = 0; i < steps.length; i++) {
    let step = steps[i];
    let num = lineNumber < 10 ? '0' + lineNumber.toString() : lineNumber.toString();
    if (i == 0 && steps.length > 1) {
      // First line: show starting symbol → first expansion
      let nextStep = steps[1];
      result += num + ' ' + step.sententialForm + '    → ' + nextStep.sententialForm + '\n';
      lineNumber++;
    } else if (i == 1) {
      // Skip step 1 since it was already shown on line 1 as the right side of the arrow
      continue;
    } else if (i > 1) {
      // Subsequent lines: show → expansion (left side is implied from previous)
      result += num + '              → ' + step.sententialForm + '\n';
      lineNumber++;
    } else {
      // Edge case: only one step
      result += num + ' ' + step.sententialForm + '\n';
      lineNumber++;
    }
  }
  result += 'DERIVATION_END\n';
  
  // Add parse tree
  result += 'TREE_START\n';
  if (parseTree != null) {
    result += TreeRenderer.renderVertical(parseTree);
    result += '\n';
  }
  result += 'TREE_END\n';
  
  // Add PBASIC code
  result += 'CODE_START\n';
  result += pbasicCode;
  result += 'CODE_END\n';
  
  return result;
}