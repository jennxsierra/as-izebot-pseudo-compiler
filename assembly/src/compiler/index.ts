import { Lexer } from '../analysis/lexer';
import { Parser } from '../analysis/parser';
import { TreeRenderer } from '../analysis/tree';
import { CodeGenerator } from '../generator/intermediateCode';
import { Grammar } from '../components/grammar';

// Exported functions for WASM interface
export function compile(input: string): string {
  // Step 1: Lexical analysis
  let lexer = new Lexer(input);
  let tokens = lexer.tokenize();
  
  // Step 2: Parse and derive
  let parser = new Parser(tokens);
  let success = parser.parse();
  
  if (!success) {
    let error = parser.getErrorMessage();
    if (error.length == 0) {
      error = 'Unknown parsing error';
    }
    return 'ERROR:' + error;
  }
  
  // Step 3: Get results
  let derivation = parser.getDerivation();
  let symbolTable = parser.getSymbolTable();
  let parseTree = parser.getParseTree();
  
  // Step 4: Generate PBASIC code
  let generator = new CodeGenerator(symbolTable);
  let pbasicCode = generator.generate();
  
  // Return all results as a formatted string
  let result = 'SUCCESS\n';
  
  // Add derivation
  result += 'DERIVATION_START\n';
  let steps = derivation.getSteps();
  for (let i = 0; i < steps.length; i++) {
    let step = steps[i];
    let num = step.stepNumber < 10 ? '0' + step.stepNumber.toString() : step.stepNumber.toString();
    if (i == 0) {
      result += num + ' ' + step.sententialForm + '\n';
    } else {
      result += num + '              → ' + step.sententialForm + '\n';
    }
  }
  result += 'DERIVATION_END\n';
  
  // Add parse tree
  result += 'TREE_START\n';
  if (parseTree != null) {
    result += TreeRenderer.renderVertical(parseTree);
  }
  result += 'TREE_END\n';
  
  // Add PBASIC code
  result += 'CODE_START\n';
  result += pbasicCode;
  result += 'CODE_END\n';
  
  return result;
}

export function getGrammar(): string {
  return Grammar.getBNF();
}

