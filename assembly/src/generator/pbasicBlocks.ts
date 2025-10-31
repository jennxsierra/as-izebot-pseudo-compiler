// PBASIC code block templates
export class PBASICBlocks {
  
  static getHeader(): string {
    let header = '';
    header += '\'{$STAMP BS2p}\n';
    header += '\'{$PBASIC 2.5}\n';
    header += 'KEY     VAR     Byte\n';
    header += 'Main:     DO\n';
    header += '         SERIN 3,2063,250,Timeout,[KEY]\n';
    return header;
  }

  static getFooter1(): string {
    let footer = '';
    footer += '   LOOP\n';
    footer += 'Timeout:  GOSUB Motor_OFF\n';
    footer += '    GOTO Main\n';
    footer += '\'+++++ Movement Procedure ++++++++++++++++++++++++++++++\n';
    return footer;
  }

  static getFooter2(): string {
    let footer = '';
    footer += 'Motor_OFF: LOW   13 : LOW 12 : LOW  15 : LOW 14 : RETURN\n';
    footer += '\'+++++++++++++++++++++++++++++++++++++++++++++++++++++++\n';
    return footer;
  }

  static getMovementSubroutine(move: string): string {
    if (move == 'DRVF') {
      return 'Forward:   HIGH  13 : LOW 12 : HIGH 15 : LOW 14 : RETURN\n';
    } else if (move == 'DRVB') {
      return 'Backward:  HIGH  12 : LOW 13 : HIGH 14 : LOW 15 : RETURN\n';
    } else if (move == 'TRNL') {
      return 'TurnLeft:  HIGH  13 : LOW 12 : LOW  15 : LOW 14 : RETURN\n';
    } else if (move == 'TRNR') {
      return 'TurnRight: LOW   13 : LOW 12 : HIGH 15 : LOW 14 : RETURN\n';
    } else if (move == 'SPNL') {
      return 'SpinLeft:  HIGH  13 : LOW 12 : HIGH 14 : LOW 15 : RETURN\n';
    } else if (move == 'SPNR') {
      return 'SpinRight: HIGH  12 : LOW 13 : HIGH 15 : LOW 14 : RETURN\n';
    }
    return '';
  }

  static getRoutineName(move: string): string {
    if (move == 'DRVF') return 'Forward';
    if (move == 'DRVB') return 'Backward';
    if (move == 'TRNL') return 'TurnLeft';
    if (move == 'TRNR') return 'TurnRight';
    if (move == 'SPNL') return 'SpinLeft';
    if (move == 'SPNR') return 'SpinRight';
    return '';
  }
}
