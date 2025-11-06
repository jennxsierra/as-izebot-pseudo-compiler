import { Token } from './types';

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

export function errorMessage(message: string, source: string): ParseError {
  return new ParseError('[' + source + ' Error] ' + message);
}

export function errorToken(token: Token, message: string, source: string): ParseError {
  const lexeme = token.value;
  return new ParseError('[' + source + ' Error] ' + message + " ['" + lexeme + "' @ index " + token.position.toString() + "]");
}

export function errorTokens(tokens: Token[], message: string, source: string): ParseError {
  let tokenString = '';
  for (let i = 0; i < tokens.length; i++) {
    if (i > 0) tokenString += ' ';
    tokenString += tokens[i].value;
  }
  const pos = tokens.length > 0 ? tokens[0].position : 0;
  return new ParseError('[' + source + ' Error] ' + message + " ['" + tokenString + "' @ index " + pos.toString() + "]");
}
