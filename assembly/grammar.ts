// assembly/grammar.ts
export function grammarAsText(): string {
  // Placeholder grammar - NOT FINALIZED
  return [
    "〈Program〉 → EXEC 〈KeyList〉 HALT",
    "〈KeyList〉 → 〈KeyStmt〉 〈KeyList〉 | ϵ",
    "〈KeyStmt〉 → key 〈KeyId〉 = 〈MoveSeq〉",
    "〈KeyId〉 → A | B | C | D",
    "〈MoveSeq〉 → 〈Move〉 〈MoveSeqTail〉",
    "〈MoveSeqTail〉 → '>' 〈Move〉 〈MoveSeqTail〉 | ϵ",
    "〈Move〉 → DRVF | DRVB | TRNL | TRNR | SPNL | SPNR",
  ].join("\n");
}
