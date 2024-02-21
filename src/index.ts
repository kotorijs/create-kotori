import { cac } from 'cac';
import { readFileSync } from 'fs';
import runner from './runner';

const program = cac();

const { version } = JSON.parse(readFileSync(`${__dirname}/../package.json`).toString());
program.version(version, '-v, --version');
program.help();

program.command('').action(() => runner().then());

program.parse();
