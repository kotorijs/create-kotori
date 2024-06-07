import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
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

  const { projectNameOrigin, projectDescription, projectAuthor, projectStyle, initializeGit } = await prompt([
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
      name: 'projectStyle',
      message: 'Do you want to use decorators style',
      default: true
    },
    {
      type: 'confirm',
      name: 'initializeGit',
      message: 'Do you want to create a git repository',
      default: true
    }
  ]);

  const projectName = String(projectNameOrigin).trim().toLocaleLowerCase().replaceAll(' ', '-');
  const workspaceDir = resolve(process.cwd(), projectName);
  const modulesDir = resolve(workspaceDir, './modules', projectName);

  /* check root dir */
  if (existsSync(workspaceDir)) {
    shell.echo(red('Error: dir already existed'));
    shell.exit();
  }

  shell.echo(white(`Workspace project in ${workspaceDir}`));

  /* copy dirs  */
  shell.cp('-r', resolve(__dirname, '../template/workspace'), workspaceDir);
  shell.cat(resolve(workspaceDir, 'kotori.toml')).to(resolve(workspaceDir, 'kotori.dev.toml'));
  shell.rm('-f', resolve(workspaceDir, 'kotori.toml'));
  shell.mkdir(resolve(workspaceDir, './modules'));
  shell.cp('-r', resolve(__dirname, '../template/base'), modulesDir);
  shell
    .cat(resolve(modulesDir, `src/index_${projectStyle ? 'decorators' : 'exports'}.ts`))
    .to(resolve(modulesDir, `src/index.ts`));
  shell.rm('-f', resolve(modulesDir, 'src/index_*.ts'));

  /* initialize git repository */
  if (initializeGit) {
    if (shell.which('git')) {
      shell.exec('git init');
    } else {
      shell.echo(yellow('Git not found, skip git repository initialization'));
    }
  }

  /* get latest version */
  let targetVersion = DEFAULT_VERSION;
  try {
    const update = await (await fetch(UPDATE_URL)).json().catch(() => null);
    targetVersion = update && update.version ? `^${update.version}` : DEFAULT_VERSION;
  } catch {
    shell.echo(red('Failed to get latest version please check your internet connection, use default version'));
  }

  /* generate files */
  const workspacePkgFile = resolve(workspaceDir, 'package.json');
  const modulePkgFile = resolve(modulesDir, 'package.json');
  const moduleReadmeFile = resolve(modulesDir, 'README.md');

  writeFileSync(
    workspacePkgFile,
    readFileSync(workspacePkgFile)
      .toString()
      .replace('module-author', projectAuthor)
      .replace(DEFAULT_VERSION, targetVersion)
  );
  writeFileSync(
    modulePkgFile,
    readFileSync(modulePkgFile)
      .toString()
      .replace('module-name', projectName)
      .replace('module-description', projectDescription)
      .replace('module-author', projectAuthor)
      .replace(DEFAULT_VERSION, targetVersion)
  );
  writeFileSync(
    moduleReadmeFile,
    readFileSync(moduleReadmeFile)
      .toString()
      .replaceAll('module-name', projectName)
      .replaceAll('module-description', projectDescription)
  );

  /* ending */
  shell.echo(
    `${yellow('Everything is ready！')}\nNow run:\n${green(`\n  cd ${projectName}\n  pnpm install\n  pnpm run format\n  pnpm run dev`)}`
  );
}
