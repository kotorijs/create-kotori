import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import {
  DEFAULT_PROJECT_AUTHOR,
  DEFAULT_PROJECT_DESCRIPTION,
  DEFAULT_PROJECT_NAME,
  DEFAULT_VERSION,
  UPDATE_URL
} from './const';
import shell from 'shelljs';
import { blue, green, red, white, yellow } from 'colorette';

export default async function () {
  /* import ecmascript modules */
  const { prompt } = (await import('inquirer')).default;

  shell.echo(blue(`KotoriBot - Cross-platform Chatbot Framework`));

  const { projectNameOrigin, projectDescription, projectAuthor, isGit } = await prompt([
    {
      type: 'input',
      name: 'projectNameOrigin',
      message: 'Input module name',
      default: DEFAULT_PROJECT_NAME
    },
    {
      type: 'input',
      name: 'projectDescription',
      message: 'Input module description',
      default: DEFAULT_PROJECT_DESCRIPTION
    },
    {
      type: 'input',
      name: 'projectAuthor',
      message: 'Input author name',
      default: DEFAULT_PROJECT_AUTHOR
    },
    {
      type: 'confirm',
      name: 'isGit',
      message: 'Do you want to create a git repository',
      default: true
    }
  ]);

  const projectName = String(projectNameOrigin).replaceAll(' ', '-');
  const dir = resolve(process.cwd(), projectName);
  const projectDir = join(dir, './project', projectName);

  /* check root dir */
  if (existsSync(dir)) {
    shell.echo(red('Error: dir already existed'));
    shell.exit();
  }

  shell.echo(white(`Workspace project in ${dir}`));

  /* copy dirs  */
  shell.cp('-r', resolve(__dirname, '../template/workspace'), dir);
  shell.cd(dir);
  shell.cp('-r', resolve(__dirname, '../template/base'), projectDir);

  /* initialize git repository */
  if (isGit && shell.which('git')) shell.exec('git init');

  /* generate files */
  const workspacePkgDir = join(dir, 'package.json');
  const pkgDir = join(projectDir, 'package.json');
  const readmeDir = join(projectDir, 'README.md');
  const update = await (await fetch(UPDATE_URL)).json();
  const newVersion = update && update.version ? `^${update.version}` : DEFAULT_VERSION;

  writeFileSync(workspacePkgDir, readFileSync(workspacePkgDir).toString()
    .replace('AUTHOR', projectAuthor)
    .replace(DEFAULT_VERSION, newVersion)
  );
  writeFileSync(
    pkgDir,
    readFileSync(pkgDir)
      .toString()
      .replace('NAME', projectName)
      .replace('DESCRIPTION', projectDescription)
      .replace('AUTHOR', projectAuthor)
      .replace(DEFAULT_VERSION, newVersion)
  );
  writeFileSync(
    readmeDir,
    readFileSync(readmeDir).toString().replace('NAME', projectName).replace('DESCRIPTION', projectDescription)
  );

  /* ending */
  shell.echo(
    `${yellow('Everything is ready！')}\nNow run:\n${green(`\n  cd ${projectName}\n  pnpm install\n  pnpm run format\n  pnpm run dev`)}`
  );
}
