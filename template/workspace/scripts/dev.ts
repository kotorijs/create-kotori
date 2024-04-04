const { join } = require('path');
const { ls, exec, cd } = require('shelljs');

const rootDir = join(__dirname, '../node_modules/.pnpm');
const list = ls(rootDir);

if (list.stderr) {
  console.error(`Cannot find dir ${rootDir}, please reinstall packages.`);
  process.exit();
}

const kotoriDir = list.find((dir) => dir.startsWith('kotori-bot@'));
cd(join(rootDir, kotoriDir, './node_modules/kotori-bot'));
exec('pnpm start');
