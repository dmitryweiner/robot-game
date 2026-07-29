import type { ManPageEntry } from '../../components/CommandReference';

export type { ManPageEntry };

/**
 * One entry per command the shell actually implements (`COMMAND_NAMES`).
 * Descriptions match OUR simplified behaviour, not the full real-world `man`
 * page — e.g. `grep` here only does plain substring matching, not regex.
 */
export const COMMAND_MAN_PAGES: Record<string, ManPageEntry> = {
  pwd: {
    name: 'pwd',
    synopsis: 'pwd',
    description: 'Печатает путь до текущего каталога.',
  },
  ls: {
    name: 'ls',
    synopsis: 'ls [-l] [путь...]',
    description:
      'Показывает содержимое каталога (или сам файл, если путь ведёт на файл). ' +
      'Без аргументов — текущий каталог. С флагом -l — подробно: права доступа, ' +
      'размер, имя. Понимает подстановку * в последнем сегменте пути, например drivers/nb_*.',
  },
  cd: {
    name: 'cd',
    synopsis: 'cd [путь]',
    description:
      'Меняет текущий каталог. Без аргумента переходит в корень /. cd .. — на уровень ' +
      'выше. cd - — обратно в предыдущий каталог.',
  },
  cat: {
    name: 'cat',
    synopsis: 'cat файл...',
    description: 'Выводит содержимое одного или нескольких файлов целиком.',
  },
  echo: {
    name: 'echo',
    synopsis: 'echo [текст...]',
    description:
      'Печатает переданный текст. Чтобы передать текст с пробелами одним аргументом, ' +
      'бери его в кавычки: echo "два слова".',
  },
  wc: {
    name: 'wc',
    synopsis: 'wc [-l] [файл]',
    description:
      'Считает строки, слова и байты. С флагом -l — только строки. Без файла читает ' +
      'стандартный ввод (то, что пришло по | или <).',
  },
  tail: {
    name: 'tail',
    synopsis: 'tail [-n N] [файл]',
    description:
      'Показывает последние N строк файла (по умолчанию 10). Без файла читает ' +
      'стандартный ввод — удобно в конце цепочки из |.',
  },
  grep: {
    name: 'grep',
    synopsis: 'grep текст [файл]',
    description:
      'Оставляет только строки, содержащие текст (обычная подстрока, не регулярное ' +
      'выражение). Без файла читает стандартный ввод.',
  },
  chmod: {
    name: 'chmod',
    synopsis: 'chmod +x файл',
    description:
      'Меняет права файла. +x выдаёт право на исполнение (без него скрипт нельзя ' +
      'запустить), -x — забирает его обратно.',
  },
  journalctl: {
    name: 'journalctl',
    synopsis: 'journalctl',
    description: 'Показывает системный журнал — сообщения о том, что происходило при загрузке.',
  },
};

/** Redirection and pipe operators — shell syntax, а не отдельные программы. */
export const OPERATOR_MAN_PAGES: ManPageEntry[] = [
  {
    name: '|',
    synopsis: 'команда1 | команда2',
    description:
      'Труба (pipe): стандартный вывод (stdout) первой команды становится стандартным ' +
      'вводом (stdin) второй.',
  },
  {
    name: '>',
    synopsis: 'команда > файл',
    description: 'Записывает стандартный вывод команды в файл, полностью заменяя его содержимое.',
  },
  {
    name: '>>',
    synopsis: 'команда >> файл',
    description: 'Дописывает стандартный вывод команды в конец файла, не стирая старое содержимое.',
  },
  {
    name: '<',
    synopsis: 'команда < файл',
    description: 'Команда читает стандартный ввод не с клавиатуры, а из файла.',
  },
  {
    name: '2>',
    synopsis: 'команда 2> файл',
    description: 'Записывает поток ошибок (stderr) команды в файл, отдельно от обычного вывода.',
  },
  {
    name: '2>&1',
    synopsis: 'команда > файл 2>&1',
    description: 'Направляет поток ошибок туда же, куда уже направлен стандартный вывод.',
  },
  {
    name: './',
    synopsis: './путь/к/скрипту',
    description:
      'Запускает исполняемый файл по пути. Без ./ (или полного пути с /) команда с таким ' +
      'именем не найдётся — это не опечатка, так работает поиск программ.',
  },
];
