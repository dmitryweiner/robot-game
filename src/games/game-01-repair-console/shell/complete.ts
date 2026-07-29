import { COMMAND_NAMES } from './commands';
import { type DirNode, getNode, listDir, resolvePath } from './fs';

function splitLastWord(value: string): { head: string; lastWord: string } {
  const lastSpace = value.lastIndexOf(' ');
  return {
    head: lastSpace === -1 ? '' : value.slice(0, lastSpace + 1),
    lastWord: lastSpace === -1 ? value : value.slice(lastSpace + 1),
  };
}

function completeCommandName(head: string, lastWord: string): string | null {
  const matches = COMMAND_NAMES.filter((name) => name.startsWith(lastWord) && name !== lastWord);
  if (matches.length !== 1) {
    return null;
  }
  return `${head}${matches[0]} `;
}

function completePath(head: string, lastWord: string, cwd: string[], fs: DirNode): string | null {
  const lastSlash = lastWord.lastIndexOf('/');
  const dirPart = lastSlash === -1 ? '' : lastWord.slice(0, lastSlash + 1);
  const namePrefix = lastSlash === -1 ? lastWord : lastWord.slice(lastSlash + 1);
  const dirInput = lastSlash === -1 ? '.' : lastWord.slice(0, lastSlash) || '/';

  const dirNode = getNode(fs, resolvePath(cwd, dirInput));
  if (!dirNode || dirNode.type !== 'dir') {
    return null;
  }

  const matches = listDir(dirNode).filter(([name]) => name.startsWith(namePrefix) && name !== namePrefix);
  if (matches.length !== 1) {
    return null;
  }
  const [name, node] = matches[0];
  return node.type === 'dir' ? `${head}${dirPart}${name}/` : `${head}${dirPart}${name} `;
}

/**
 * Tab completion for the terminal input. Only completes on a single
 * unambiguous match — ambiguous or empty matches return null and leave the
 * input untouched (no "list all options" UI, to keep this simple).
 */
export function completeInput(value: string, cwd: string[], fs: DirNode): string | null {
  const { head, lastWord } = splitLastWord(value);
  const isFirstWord = head === '';
  if (isFirstWord && !lastWord.includes('/')) {
    return completeCommandName(head, lastWord);
  }
  return completePath(head, lastWord, cwd, fs);
}
