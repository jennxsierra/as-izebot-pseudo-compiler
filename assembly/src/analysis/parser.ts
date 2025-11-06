// Parser implementing the exact BNF specified by the assignment.
// Responsibilities:
// - Validate token sequence against the grammar
// - Produce leftmost derivation steps via DerivationLogger
// - Build a simple AST (ASTNode) for tree rendering and code generation
// - Enforce precise error messages using error helpers
import { Token, TokenType } from "../components/types";
import { errorMessage, errorToken, errorTokens } from "../components/errors";
import { DerivationLogger } from "./derivation";
import { ASTNode, NodeType } from "../components/ast";

export class Parser {
  private tokens: Token[];
  private position: i32;
  private currentToken: Token;
  private derivation: DerivationLogger;
  private symbolMap: Map<string, string>;
  private parseTree: ASTNode | null;
  private errorMessage: string;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.position = 0;
    this.currentToken =
      tokens.length > 0 ? tokens[0] : new Token(TokenType.EOF, "", 0);
    this.derivation = new DerivationLogger();
    this.symbolMap = new Map<string, string>();
    this.parseTree = null;
    this.errorMessage = "";
  }

  // Centralized reporter: set parser error message and log it.
  private report(message: string): void {
    this.errorMessage = message;
    console.error(message);
  }

  // Helper to get a contiguous window of tokens starting at `start` up to (but not including)
  // the first token whose type is in `stopTypes`.
  private getWindow(start: i32, stopTypes: TokenType[]): Token[] {
    let look: i32 = start;
    while (look < this.tokens.length) {
      let t = this.tokens[look].type;
      let found: bool = false;
      for (let i = 0; i < stopTypes.length; i++) {
        if (t == stopTypes[i]) {
          found = true;
          break;
        }
      }
      if (found) break;
      look++;
    }
    let win: Token[] = [];
    for (let i = start; i < look; i++) win.push(this.tokens[i]);
    return win;
  }

  // Validate an assignment token window (tokens between current position and the next '>' or HALT).
  // Throws precise ParseErrors per the instruction file on violation.
  private validateAssignmentWindow(tokenList: Token[], startIndex: i32): bool {
    let eqCount: i32 = 0;
    let eqIndex: i32 = -1;
    for (let i = 0; i < tokenList.length; i++) {
      if (tokenList[i].type == TokenType.EQUALS) {
        eqCount++;
        if (eqIndex == -1) eqIndex = i;
      }
    }

    // If the token window is empty, there's an immediate '>' (or HALT/EOF) at `startIndex`.
    // Report a clearer error pointing at that token instead of an empty token list.
    if (tokenList.length == 0) {
      if (startIndex < this.tokens.length) {
        const offending = this.tokens[startIndex];
        this.report(
          errorToken(
            offending,
            "Missing assignment before '>'",
            this.getSourceTag("<binding>")
          ).message
        );
        return false;
      }
      // Fallback to the generic '=' message when we can't locate the offending token
      this.report(
        errorTokens(
          tokenList,
          "Expected '=' in assignment",
          this.getSourceTag("<binding>")
        ).message
      );
      return false;
    }

    if (eqCount == 0) {
      this.report(
        errorTokens(
          tokenList,
          "Expected '=' in assignment",
          this.getSourceTag("<binding>")
        ).message
      );
      return false;
    }

    if (eqCount > 1) {
      // Report the generic multiple '=' error (keeps existing message), then
      // also point at the second '=' which usually indicates where a '>' is missing.
      this.report(
        errorTokens(
          tokenList,
          "Multiple '=' found in assignment",
          this.getSourceTag("<binding>")
        ).message
      );

      // Find the second '=' token within the window
      let seen: i32 = 0;
      let secondEqIndex: i32 = -1;
      for (let i = 0; i < tokenList.length; i++) {
        if (tokenList[i].type == TokenType.EQUALS) {
          seen++;
          if (seen == 2) {
            secondEqIndex = i;
            break;
          }
        }
      }
      if (secondEqIndex != -1) {
        // Prefer reporting the position where the next binding begins (the 'key' token)
        // which is the correct insertion point for the missing '>' separator.
        let insertIndex: i32 = -1;
        // eqIndex is the index of the first '=' inside tokenList
        for (let i = eqIndex + 1; i < tokenList.length; i++) {
          if (tokenList[i].type == TokenType.KEY) {
            insertIndex = tokenList[i].position;
            break;
          }
        }
        // Fallback: use the second '=' position if we couldn't find a next 'key'
        if (insertIndex == -1) insertIndex = tokenList[secondEqIndex].position;

        this.report(
          errorMessage(
            "Missing '>' between assignments @ index " + insertIndex.toString(),
            this.getSourceTag("<binding>")
          ).message
        );
      }
      return false;
    }

    // Single '=' checks
    if (eqCount == 1) {
      if (eqIndex == 0 && tokenList.length == 1) {
        this.report(
          errorToken(
            tokenList[eqIndex],
            "Missing key and movement for '='",
            this.getSourceTag("<binding>")
          ).message
        );
        return false;
      }
      if (eqIndex == 0) {
        this.report(
          errorToken(
            tokenList[eqIndex],
            "Missing key before '='",
            this.getSourceTag("<binding>")
          ).message
        );
        return false;
      }
      if (eqIndex == tokenList.length - 1) {
        this.report(
          errorToken(
            tokenList[eqIndex],
            "Missing movement after '='",
            this.getSourceTag("<binding>")
          ).message
        );
        return false;
      }
      let afterCount = tokenList.length - (eqIndex + 1);
      if (afterCount > 1) {
        let movementTokens: Token[] = [];
        for (let i = eqIndex + 1; i < tokenList.length; i++)
          movementTokens.push(tokenList[i]);
        this.report(
          errorTokens(
            movementTokens,
            "There should be only 1 movement",
            this.getSourceTag("<binding>")
          ).message
        );
        return false;
      }
    }

    return true;
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
    // Map nonterminal to source tag required by instruction file
    let sourceTag = this.getSourceTag(nonterminal);
    let expectedName = this.getTokenTypeName(expectedType);
    {
      const pe = errorToken(
        this.currentToken,
        "Expected '" + expectedName + "'",
        sourceTag
      );
      this.errorMessage = pe.message;
      console.error(pe.message);
      return false;
    }
  }

  private getTokenTypeName(type: TokenType): string {
    if (type == TokenType.EXEC) return "EXEC";
    if (type == TokenType.HALT) return "HALT";
    if (type == TokenType.KEY) return "key";
    if (type == TokenType.EQUALS) return "=";
    if (type == TokenType.GREATER) return ">";
    if (type == TokenType.KEY_ID) return "KEY_ID (A|B|C|D)";
    if (type == TokenType.MOVE) return "MOVE (DRVF|DRVB|TRNL|TRNR|SPNL|SPNR)";
    return "EOF";
  }

  parse(): ASTNode | null {
    // Parser methods return null on error.
    this.parseTree = this.parseProgram();
    return this.parseTree;
  }

  private parseProgram(): ASTNode | null {
    // Program-level validations per instructions
    // Check presence of EXEC and HALT and positions
    let execIndex = -1;
    let haltIndices: i32[] = [];
    for (let i = 0; i < this.tokens.length; i++) {
      if (this.tokens[i].type == TokenType.EXEC && execIndex == -1)
        execIndex = i;
      if (this.tokens[i].type == TokenType.HALT) haltIndices.push(i);
    }

    if (execIndex == -1) {
      this.report(
        errorMessage(
          "The program input must start with EXEC",
          this.getSourceTag("<program>")
        ).message
      );
      return null;
    }

    if (haltIndices.length == 0) {
      this.report(
        errorMessage(
          "The program input must end with HALT",
          this.getSourceTag("<program>")
        ).message
      );
      return null;
    }

    if (haltIndices.length > 1) {
      // Report the extra HALT token
      let extraHalt = this.tokens[haltIndices[1]];
      this.report(
        errorToken(
          extraHalt,
          "Multiple HALT found (only one allowed at the end)",
          this.getSourceTag("<program>")
        ).message
      );
      return null;
    }

    let haltIndex = haltIndices.length > 0 ? haltIndices[0] : -1;
    // Extra input after HALT (exclude EOF token at end)
    if (haltIndex != -1) {
      // any non-EOF tokens after halt?
      if (haltIndex + 1 < this.tokens.length - 1) {
        let afterTokens: Token[] = [];
        for (let i = haltIndex + 1; i < this.tokens.length - 1; i++) {
          afterTokens.push(this.tokens[i]);
        }
        if (afterTokens.length > 0) {
          this.report(
            errorTokens(
              afterTokens,
              "Extra input found after HALT",
              this.getSourceTag("<program>")
            ).message
          );
          return null;
        }
      }
    }

    if (haltIndex <= execIndex + 1) {
      this.report(
        errorMessage(
          "The program input contains no statements between EXEC and HALT",
          this.getSourceTag("<program>")
        ).message
      );
      return null;
    }

    // <program> -> EXEC <stmt_list> HALT
    // Step 1: Just <program>
    this.derivation.addStep("<program>");
    // Step 2: Expand <program>
    this.derivation.addStep("EXEC <stmt_list> HALT");

    let node = new ASTNode(NodeType.PROGRAM, "<program>");

    if (!this.expect(TokenType.EXEC, "<program>")) return null;
    let execNode = new ASTNode(NodeType.TERMINAL, "EXEC");
    node.addChild(execNode);

    let stmtList = this.parseStmtList("EXEC ", " HALT");
    if (stmtList == null) return null;
    node.addChild(stmtList);

    if (!this.expect(TokenType.HALT, "<program>")) return null;
    let haltNode = new ASTNode(NodeType.TERMINAL, "HALT");
    node.addChild(haltNode);

    if (this.currentToken.type != TokenType.EOF) {
      this.report(
        errorToken(
          this.currentToken,
          "Extra input found after HALT",
          this.getSourceTag("<program>")
        ).message
      );
      return null;
    }

    return node;
  }

  private parseStmtList(prefix: string, suffix: string): ASTNode | null {
    // <stmt_list> -> <binding> > | <binding> > <stmt_list>
    let node = new ASTNode(NodeType.STMT_LIST, "<stmt_list>");

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

    let hasMoreBindings =
      lookaheadPos < this.tokens.length &&
      this.tokens[lookaheadPos].type == TokenType.KEY;

    // Add the appropriate derivation step
    if (hasMoreBindings) {
      this.derivation.addFormatted(prefix, "<binding> > <stmt_list>", suffix);
    } else {
      this.derivation.addFormatted(prefix, "<binding> >", suffix);
    }

    let binding = this.parseBinding(
      prefix,
      hasMoreBindings ? " > <stmt_list>" + suffix : " >" + suffix
    );
    if (binding == null) return null;
    node.addChild(binding);

    if (!this.expect(TokenType.GREATER, "<stmt_list>")) return null;
    let greaterNode = new ASTNode(NodeType.TERMINAL, ">");
    node.addChild(greaterNode);

    // Check if there's another statement
    if (this.currentToken.type == TokenType.KEY) {
      let expandedBinding = this.getNodeText(binding);
      let nextStmtList = this.parseStmtList(
        prefix + expandedBinding + " > ",
        suffix
      );
      if (nextStmtList == null) return null;
      node.addChild(nextStmtList);
    }

    return node;
  }

  private getSourceTag(nonterminal: string): string {
    if (nonterminal == "<program>") return "Program";
    if (nonterminal == "<stmt_list>") return "Statement";
    if (nonterminal == "<binding>") return "Assignment";
    if (nonterminal == "<key>") return "Key";
    if (nonterminal == "<move>") return "Movement";
    if (nonterminal == "<key_id>") return "Key ID";
    // Default
    return "Statement";
  }

  private parseBinding(prefix: string, suffix: string): ASTNode | null {
    // <binding> -> <key> = <move>
    // Before consuming tokens, validate assignment-level constraints on the token window
    let start = this.position;
    // Get token window for this binding (up to next '>' or HALT/EOF)
    let tokenList: Token[] = this.getWindow(start, [
      TokenType.GREATER,
      TokenType.HALT,
      TokenType.EOF,
    ]);

    // Validate assignment-level constraints (returns false on violation)
    if (!this.validateAssignmentWindow(tokenList, start)) return null;

    this.derivation.addFormatted(prefix, "<key> = <move>", suffix);

    let node = new ASTNode(NodeType.BINDING, "<binding>");

    let key = this.parseKey(prefix, " = <move>" + suffix);
    if (key == null) return null;
    node.addChild(key);

    if (!this.expect(TokenType.EQUALS, "<binding>")) return null;
    let equalsNode = new ASTNode(NodeType.TERMINAL, "=");
    node.addChild(equalsNode);

    let expandedKey = this.getNodeText(key);
    let move = this.parseMove(prefix + expandedKey + " = ", suffix);
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
    this.derivation.addFormatted(prefix, "key <key_id>", suffix);

    let node = new ASTNode(NodeType.KEY, "<key>");

    // First token must be 'key'
    if (this.currentToken.type != TokenType.KEY) {
      this.report(
        errorToken(
          this.currentToken,
          "Expected keyword 'key', got '" + this.currentToken.value + "'",
          this.getSourceTag("<key>")
        ).message
      );
      return null;
    }

    // Look ahead tokens between 'key' and '=' or '>' to validate counts
    let start = this.position;
    let keyWindow: Token[] = this.getWindow(start, [
      TokenType.EQUALS,
      TokenType.GREATER,
      TokenType.HALT,
      TokenType.EOF,
    ]);

    // keyWindow includes 'key' plus following tokens until '=' or '>'
    if (keyWindow.length < 2) {
      this.report(
        errorTokens(
          keyWindow,
          "No key value was given",
          this.getSourceTag("<key>")
        ).message
      );
      return null;
    }
    if (keyWindow.length > 2) {
      this.report(
        errorTokens(
          keyWindow,
          "Too many key values given",
          this.getSourceTag("<key>")
        ).message
      );
      return null;
    }

    if (!this.expect(TokenType.KEY, "<key>")) return null;
    let keywordNode = new ASTNode(NodeType.TERMINAL, "key");
    node.addChild(keywordNode);

    let keyId = this.parseKeyId(prefix + "key ", suffix);
    if (keyId == null) return null;
    node.addChild(keyId);

    return node;
  }

  private parseKeyId(prefix: string, suffix: string): ASTNode | null {
    // <key_id> -> A | B | C | D
    let node = new ASTNode(NodeType.KEY_ID, "<key_id>");

    // Key ID token must be of type KEY_ID
    if (this.currentToken.type != TokenType.KEY_ID) {
      this.report(
        errorToken(
          this.currentToken,
          "Invalid key id. \nValid key id values are {A, B, C, D}",
          this.getSourceTag("<key_id>")
        ).message
      );
      return null;
    }

    // consume the KEY_ID
    this.advance();

    // Safe to access value after consuming
    let keyIdValue = this.tokens[this.position - 1].value;
    this.derivation.addFormatted(prefix, keyIdValue, suffix);

    let terminalNode = new ASTNode(NodeType.TERMINAL, keyIdValue);
    node.addChild(terminalNode);

    return node;
  }

  private parseMove(prefix: string, suffix: string): ASTNode | null {
    // <move> -> DRVF | DRVB | TRNL | TRNR | SPNL | SPNR
    let node = new ASTNode(NodeType.MOVE, "<move>");
    // Movement token must be of type MOVE
    if (this.currentToken.type != TokenType.MOVE) {
      this.report(
        errorToken(
          this.currentToken,
          "Invalid movement value. \nValid movement values are {DRVF, DRVB, TRNL, TRNR, SPNL, SPNR}",
          this.getSourceTag("<move>")
        ).message
      );
      return null;
    }
    // consume
    this.advance();

    // Safe to access value after consuming
    let moveValue = this.tokens[this.position - 1].value;
    this.derivation.addFormatted(prefix, moveValue, suffix);

    let terminalNode = new ASTNode(NodeType.TERMINAL, moveValue);
    node.addChild(terminalNode);

    return node;
  }

  private getNodeText(node: ASTNode): string {
    // Delegate to ASTNode.text()
    return node.text();
  }

  private getKeyValue(keyNode: ASTNode): string {
    // The <key> node has the form: 'key' <key_id>
    // ASTNode.firstTerminalValue() returns the first terminal (which is the literal 'key'),
    // so explicitly return the KEY_ID child value when available.
    if (keyNode.nodeType == NodeType.KEY && keyNode.children.length >= 2) {
      return keyNode.children[1].firstTerminalValue();
    }
    // Fallback: return the first terminal value
    return keyNode.firstTerminalValue();
  }

  private getMoveValue(moveNode: ASTNode): string {
    return moveNode.firstTerminalValue();
  }

  private addSymbol(key: string, move: string): void {
    // Map.set will add or replace existing mapping
    this.symbolMap.set(key, move);
  }

  // Check whether a symbol exists in the map
  hasSymbol(key: string): bool {
    return this.symbolMap.has(key);
  }

  // Safely get a symbol's mapped move; returns empty string when missing
  getSymbol(key: string): string {
    if (this.symbolMap.has(key)) return this.symbolMap.get(key);
    return "";
  }

  // Expose the internal map for callers that want to iterate directly.
  // Callers must use has() before get() to avoid exceptions on missing keys.
  getSymbolMap(): Map<string, string> {
    return this.symbolMap;
  }

  getDerivation(): DerivationLogger {
    return this.derivation;
  }

  getParseTree(): ASTNode | null {
    return this.parseTree;
  }

  getErrorMessage(): string {
    return this.errorMessage;
  }
}
