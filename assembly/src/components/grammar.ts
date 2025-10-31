// BNF Grammar definition
export class Grammar {
  
  static getBNF(): string {
    let bnf = '';
    bnf += '<program> -> EXEC <stmt_list> HALT\n';
    bnf += '<stmt_list> -> <binding> > | <binding> > <stmt_list>\n';
    bnf += '<binding> -> <key> = <move>\n';
    bnf += '<key> -> key <key_id>\n';
    bnf += '<key_id> -> A | B | C | D\n';
    bnf += '<move> -> DRVF | DRVB | TRNL | TRNR | SPNL | SPNR\n';
    return bnf;
  }
}
