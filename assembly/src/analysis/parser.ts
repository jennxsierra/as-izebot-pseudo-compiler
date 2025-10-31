import { Token, TokenType, SymbolEntry } from '../components/types';
import { ErrorReporter } from '../components/errors';
import { DerivationLogger } from './derivation';
import { ASTNode, NodeType } from '../components/ast';

export class Parser {
  private tokens: Token[];
  private position: i32;
  private currentToken: Token;
  private derivation: DerivationLogger;
  private symbolTable: SymbolEntry[];
  private parseTree: ASTNode | null;
  private errorMessage: string;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.position = 0;
    this.currentToken = tokens.length > 0 ? tokens[0] : new Token(TokenType.EOF, '', 0);
    this.derivation = new DerivationLogger();
    this.symbolTable = [];
    this.parseTree = null;
    this.errorMessage = '';
  }

  private advance(): void {
    this.position++;
    if (this.position < this.tokens.length) {
      this.currentToken = this.tokens[this.position];
    }
  }

  private match(expectedType: TokenType): bool {
    if (this.currentToken.type == expectedType) {
      this.advance();
      return true;
    }
    return false;
  }

  private expect(expectedType: TokenType, nonterminal: string): bool {
    if (this.currentToken.type == expectedType) {
      this.advance();
      return true;
    }
    let expected: string[] = [];
    expected.push(this.getTokenTypeName(expectedType));
    let lookahead = this.currentToken.value.length > 0 ? this.currentToken.value : 'EOF';
    this.errorMessage = ErrorReporter.reportSyntaxError(nonterminal, lookahead, expected);
    return false;
  }

  private getTokenTypeName(type: TokenType): string {
    if (type == TokenType.EXEC) return 'EXEC';
    if (type == TokenType.HALT) return 'HALT';
    if (type == TokenType.KEY) return 'key';
    if (type == TokenType.EQUALS) return '=';
    if (type == TokenType.GREATER) return '>';
    if (type == TokenType.KEY_ID) return 'KEY_ID (A|B|C|D)';
    if (type == TokenType.MOVE) return 'MOVE (DRVF|DRVB|TRNL|TRNR|SPNL|SPNR)';
    return 'EOF';
  }

  parse(): bool {
    // Check for invalid tokens first
    for (let i = 0; i < this.tokens.length; i++) {
      if (this.tokens[i].type == TokenType.INVALID) {
        this.errorMessage = ErrorReporter.reportLexicalError(
          this.tokens[i].value, 
          this.tokens[i].position
        );
        return false;
      }
    }

    this.parseTree = this.parseProgram();
    return this.parseTree != null;
  }

  private parseProgram(): ASTNode | null {
    // <program> -> EXEC <stmt_list> HALT
    // Step 1: Just <program>
    this.derivation.addStep('<program>');
    // Step 2: Expand <program>
    this.derivation.addStep('EXEC <stmt_list> HALT');
    
    let node = new ASTNode(NodeType.PROGRAM, '<program>');
    
    if (!this.expect(TokenType.EXEC, '<program>')) return null;
    let execNode = new ASTNode(NodeType.TERMINAL, 'EXEC');
    node.addChild(execNode);

    let stmtList = this.parseStmtList('EXEC ', ' HALT');
    if (stmtList == null) return null;
    node.addChild(stmtList);

    if (!this.expect(TokenType.HALT, '<program>')) return null;
    let haltNode = new ASTNode(NodeType.TERMINAL, 'HALT');
    node.addChild(haltNode);

    if (this.currentToken.type != TokenType.EOF) {
      let expected: string[] = ['EOF'];
      this.errorMessage = ErrorReporter.reportSyntaxError('<program>', this.currentToken.value, expected);
      return null;
    }

    return node;
  }

  private parseStmtList(prefix: string, suffix: string): ASTNode | null {
    // <stmt_list> -> <binding> > | <binding> > <stmt_list>
    let node = new ASTNode(NodeType.STMT_LIST, '<stmt_list>');

    // Look ahead to determine which production to use
    let lookaheadPos = this.position;
    let depth = 0;
    // Skip to the > after this binding
    while (lookaheadPos < this.tokens.length) {
      if (this.tokens[lookaheadPos].type == TokenType.GREATER && depth == 0) {
        break;
      }
      lookaheadPos++;
    }
    lookaheadPos++; // Move past the >
    
    let hasMoreBindings = lookaheadPos < this.tokens.length && this.tokens[lookaheadPos].type == TokenType.KEY;
    
    // Add the appropriate derivation step
    if (hasMoreBindings) {
      this.derivation.addStep(prefix + '<binding> > <stmt_list>' + suffix);
    } else {
      this.derivation.addStep(prefix + '<binding> >' + suffix);
    }
    
    let binding = this.parseBinding(prefix, hasMoreBindings ? ' > <stmt_list>' + suffix : ' >' + suffix);
    if (binding == null) return null;
    node.addChild(binding);

    if (!this.expect(TokenType.GREATER, '<stmt_list>')) return null;
    let greaterNode = new ASTNode(NodeType.TERMINAL, '>');
    node.addChild(greaterNode);

    // Check if there's another statement
    if (this.currentToken.type == TokenType.KEY) {
      let expandedBinding = this.getNodeText(binding);
      let nextStmtList = this.parseStmtList(prefix + expandedBinding + ' > ', suffix);
      if (nextStmtList == null) return null;
      node.addChild(nextStmtList);
    }

    return node;
  }

  private parseBinding(prefix: string, suffix: string): ASTNode | null {
    // <binding> -> <key> = <move>
    this.derivation.addStep(prefix + '<key> = <move>' + suffix);
    
    let node = new ASTNode(NodeType.BINDING, '<binding>');

    let key = this.parseKey(prefix, ' = <move>' + suffix);
    if (key == null) return null;
    node.addChild(key);

    if (!this.expect(TokenType.EQUALS, '<binding>')) return null;
    let equalsNode = new ASTNode(NodeType.TERMINAL, '=');
    node.addChild(equalsNode);

    let expandedKey = this.getNodeText(key);
    let move = this.parseMove(prefix + expandedKey + ' = ', suffix);
    if (move == null) return null;
    node.addChild(move);

    // Add to symbol table
    let keyValue = this.getKeyValue(key);
    let moveValue = this.getMoveValue(move);
    this.addSymbol(keyValue, moveValue);

    return node;
  }

  private parseKey(prefix: string, suffix: string): ASTNode | null {
    // <key> -> key <key_id>
    this.derivation.addStep(prefix + 'key <key_id>' + suffix);
    
    let node = new ASTNode(NodeType.KEY, '<key>');

    if (!this.expect(TokenType.KEY, '<key>')) return null;
    let keywordNode = new ASTNode(NodeType.TERMINAL, 'key');
    node.addChild(keywordNode);

    let keyId = this.parseKeyId(prefix + 'key ', suffix);
    if (keyId == null) return null;
    node.addChild(keyId);

    return node;
  }

  private parseKeyId(prefix: string, suffix: string): ASTNode | null {
    // <key_id> -> A | B | C | D
    let node = new ASTNode(NodeType.KEY_ID, '<key_id>');

    if (!this.expect(TokenType.KEY_ID, '<key_id>')) return null;
    
    // Safe to access value after expect succeeds
    let keyIdValue = this.tokens[this.position - 1].value;
    this.derivation.addStep(prefix + keyIdValue + suffix);
    
    let terminalNode = new ASTNode(NodeType.TERMINAL, keyIdValue);
    node.addChild(terminalNode);

    return node;
  }

  private parseMove(prefix: string, suffix: string): ASTNode | null {
    // <move> -> DRVF | DRVB | TRNL | TRNR | SPNL | SPNR
    let node = new ASTNode(NodeType.MOVE, '<move>');

    if (!this.expect(TokenType.MOVE, '<move>')) return null;
    
    // Safe to access value after expect succeeds
    let moveValue = this.tokens[this.position - 1].value;
    this.derivation.addStep(prefix + moveValue + suffix);
    
    let terminalNode = new ASTNode(NodeType.TERMINAL, moveValue);
    node.addChild(terminalNode);

    return node;
  }
  
  private getNodeText(node: ASTNode): string {
    if (node.children.length == 0) {
      return node.value;
    }
    let result = '';
    for (let i = 0; i < node.children.length; i++) {
      result += this.getNodeText(node.children[i]);
      if (i < node.children.length - 1) {
        result += ' ';
      }
    }
    return result;
  }

  private getKeyValue(keyNode: ASTNode): string {
    // Navigate to the KEY_ID terminal
    if (keyNode.children.length >= 2) {
      let keyIdNode = keyNode.children[1];
      if (keyIdNode.children.length > 0) {
        return keyIdNode.children[0].value;
      }
    }
    return '';
  }

  private getMoveValue(moveNode: ASTNode): string {
    // Navigate to the MOVE terminal
    if (moveNode.children.length > 0) {
      return moveNode.children[0].value;
    }
    return '';
  }

  private addSymbol(key: string, move: string): void {
    // Check if key already exists, update if so
    for (let i = 0; i < this.symbolTable.length; i++) {
      if (this.symbolTable[i].key == key) {
        this.symbolTable[i].move = move;
        return;
      }
    }
    // Add new entry
    this.symbolTable.push(new SymbolEntry(key, move));
  }

  getDerivation(): DerivationLogger {
    return this.derivation;
  }

  getSymbolTable(): SymbolEntry[] {
    return this.symbolTable;
  }

  getParseTree(): ASTNode | null {
    return this.parseTree;
  }

  getErrorMessage(): string {
    return this.errorMessage;
  }

  private replaceFirst(str: string, search: string, replacement: string): string {
    // Manual string replace implementation for AssemblyScript
    let index = str.indexOf(search);
    if (index < 0) return str;
    return str.substring(0, index) + replacement + str.substring(index + search.length);
  }
}
