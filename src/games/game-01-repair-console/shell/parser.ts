export type RedirectionType = '>' | '>>' | '<' | '2>' | '2>&1';

export interface Redirection {
  type: RedirectionType;
  target?: string;
}

export interface ParsedCommand {
  name: string;
  args: string[];
  redirections: Redirection[];
}

export interface ParsedPipeline {
  commands: ParsedCommand[];
  error?: string;
}

const OPERATORS: string[] = ['2>&1', '>>', '2>', '>', '<', '|'];

function tokenize(line: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === ' ' || ch === '\t') {
      i++;
      continue;
    }
    if (ch === '"') {
      let j = i + 1;
      let buf = '';
      while (j < line.length && line[j] !== '"') {
        buf += line[j];
        j++;
      }
      tokens.push(buf);
      i = j + 1;
      continue;
    }
    const operator = OPERATORS.find((op) => line.startsWith(op, i));
    if (operator) {
      tokens.push(operator);
      i += operator.length;
      continue;
    }
    let j = i;
    while (j < line.length && !' \t"|<>'.includes(line[j])) {
      j++;
    }
    tokens.push(line.slice(i, j));
    i = j;
  }
  return tokens;
}

function isOperator(token: string): boolean {
  return OPERATORS.includes(token);
}

function parseSegment(tokens: string[]): { command?: ParsedCommand; error?: string } {
  const words: string[] = [];
  const redirections: Redirection[] = [];
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    if (token === '2>&1') {
      redirections.push({ type: '2>&1' });
      i++;
      continue;
    }
    if (token === '>' || token === '>>' || token === '<' || token === '2>') {
      const target = tokens[i + 1];
      if (!target || isOperator(target)) {
        return { error: `syntax error near unexpected token '${target ?? 'newline'}'` };
      }
      redirections.push({ type: token, target });
      i += 2;
      continue;
    }
    words.push(token);
    i++;
  }
  if (words.length === 0) {
    return { error: 'syntax error: empty command' };
  }
  return { command: { name: words[0], args: words.slice(1), redirections } };
}

export function parseLine(line: string): ParsedPipeline {
  const tokens = tokenize(line);
  if (tokens.length === 0) {
    return { commands: [] };
  }

  const segments: string[][] = [[]];
  for (const token of tokens) {
    if (token === '|') {
      segments.push([]);
    } else {
      segments[segments.length - 1].push(token);
    }
  }

  const commands: ParsedCommand[] = [];
  for (const segment of segments) {
    const result = parseSegment(segment);
    if (result.error || !result.command) {
      return { commands: [], error: result.error ?? 'syntax error' };
    }
    commands.push(result.command);
  }
  return { commands };
}
