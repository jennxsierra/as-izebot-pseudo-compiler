// Token types for lexical analysis
export enum TokenType {
  EXEC,
  HALT,
  KEY,
  EQUALS,
  GREATER,
  KEY_ID,
  MOVE,
  EOF,
  INVALID
}

// Movement types
export enum MoveType {
  DRVF,
  DRVB,
  TRNL,
  TRNR,
  SPNL,
  SPNR
}

// Key identifier types
export enum KeyID {
  A,
  B,
  C,
  D
}

// Token class
export class Token {
  type: TokenType;
  value: string;
  position: i32;

  constructor(type: TokenType, value: string, position: i32) {
    this.type = type;
    this.value = value;
    this.position = position;
  }
}

// Derivation step for leftmost derivation
export class DerivationStep {
  stepNumber: i32;
  sententialForm: string;

  constructor(stepNumber: i32, sententialForm: string) {
    this.stepNumber = stepNumber;
    this.sententialForm = sententialForm;
  }
}
