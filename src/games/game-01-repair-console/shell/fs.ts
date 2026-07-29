export interface FileNode {
  type: 'file';
  content: string;
  executable: boolean;
}

export interface DirNode {
  type: 'dir';
  children: Record<string, FsNode>;
}

export type FsNode = FileNode | DirNode;

export function file(content: string, executable = false): FileNode {
  return { type: 'file', content, executable };
}

export function dir(children: Record<string, FsNode> = {}): DirNode {
  return { type: 'dir', children };
}

const NB_INIT_SCRIPT = [
  '#!/bin/sh',
  '# northbridge driver init',
  'insmod nb_core.ko',
  'insmod nb_motor_left.ko',
  'insmod nb_motor_right.ko',
  'insmod nb_balance.ko',
  'echo "northbridge: motor subsystem online"',
  '',
].join('\n');

export function createInitialFs(): DirNode {
  return dir({
    bin: dir({}),
    boot: dir({}),
    dev: dir({
      null: file(''),
    }),
    drivers: dir({
      'nb_core.ko': file('[binary kernel object]'),
      'nb_motor_left.ko': file('[binary kernel object]'),
      'nb_motor_right.ko': file('[binary kernel object]'),
      'nb_balance.ko': file('[binary kernel object]'),
      'nb_init.sh': file(NB_INIT_SCRIPT, false),
      'fan_ctrl.ko': file('[binary kernel object]'),
      'display_hdmi.ko': file('[binary kernel object]'),
    }),
    etc: dir({}),
    home: dir({}),
    lib: dir({}),
    proc: dir({}),
    sys: dir({}),
    var: dir({}),
    tmp: dir({}),
  });
}

export function formatPath(path: string[]): string {
  return path.length === 0 ? '/' : '/' + path.join('/');
}

export function resolvePath(cwd: string[], input: string): string[] {
  const base = input.startsWith('/') ? [] : [...cwd];
  const parts = input.split('/').filter((part) => part.length > 0);
  for (const part of parts) {
    if (part === '.') {
      continue;
    }
    if (part === '..') {
      base.pop();
      continue;
    }
    base.push(part);
  }
  return base;
}

export function getNode(root: DirNode, path: string[]): FsNode | undefined {
  let current: FsNode = root;
  for (const segment of path) {
    if (current.type !== 'dir') {
      return undefined;
    }
    const next: FsNode | undefined = current.children[segment];
    if (!next) {
      return undefined;
    }
    current = next;
  }
  return current;
}

export function getParentDir(root: DirNode, path: string[]): DirNode | undefined {
  if (path.length === 0) {
    return undefined;
  }
  const parentNode = getNode(root, path.slice(0, -1));
  return parentNode && parentNode.type === 'dir' ? parentNode : undefined;
}

export function cloneFs(root: DirNode): DirNode {
  return structuredClone(root);
}

export function listDir(node: DirNode): Array<[string, FsNode]> {
  return Object.entries(node.children).sort(([a], [b]) => a.localeCompare(b));
}

/** Mutates a clone of root: writes (or appends to) the file at `path`. Creates the file if missing. */
export function writeFile(root: DirNode, path: string[], content: string, append: boolean): DirNode {
  const next = cloneFs(root);
  const parent = getParentDir(next, path);
  if (!parent) {
    throw new Error(`No such directory: ${formatPath(path.slice(0, -1))}`);
  }
  const name = path[path.length - 1];
  const existing = parent.children[name];
  if (existing && existing.type === 'dir') {
    throw new Error(`Is a directory: ${formatPath(path)}`);
  }
  const previous = append && existing ? existing.content : '';
  const separator = append && previous.length > 0 && !previous.endsWith('\n') ? '\n' : '';
  parent.children[name] = file(previous + separator + content, existing?.executable ?? false);
  return next;
}

export function setExecutable(root: DirNode, path: string[], executable: boolean): DirNode {
  const next = cloneFs(root);
  const node = getNode(next, path);
  if (!node) {
    throw new Error(`No such file: ${formatPath(path)}`);
  }
  if (node.type !== 'file') {
    throw new Error(`Not a file: ${formatPath(path)}`);
  }
  node.executable = executable;
  return next;
}

/** Expands a single wildcard ('*') pattern against the directory listing it resolves into. */
export function globMatch(root: DirNode, cwd: string[], pattern: string): string[] {
  const lastSlash = pattern.lastIndexOf('/');
  const dirPart = lastSlash === -1 ? '' : pattern.slice(0, lastSlash);
  const namePart = lastSlash === -1 ? pattern : pattern.slice(lastSlash + 1);
  const dirPath = resolvePath(cwd, dirPart || '.');
  const dirNode = getNode(root, dirPath);
  if (!dirNode || dirNode.type !== 'dir') {
    return [];
  }
  const regex = new RegExp('^' + namePart.split('*').map(escapeRegExp).join('.*') + '$');
  return listDir(dirNode)
    .map(([name]) => name)
    .filter((name) => regex.test(name))
    .map((name) => (dirPart ? `${dirPart}/${name}` : name));
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
