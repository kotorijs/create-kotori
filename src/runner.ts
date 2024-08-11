import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  DEFAULT_PROJECT_AUTHOR,
  DEFAULT_PROJECT_DESCRIPTION,
  DEFAULT_PROJECT_NAME,
  DEPS_URL,
  TEMPLATE_REPO,
  TEMPLATE_REPO_NAME
} from './const'
import shell from 'shelljs'
import { blue, green, red, white, yellow } from 'colorette'
import { input, confirm } from '@inquirer/prompts'

function getGitName() {
  const username = shell.exec('git config user.name', { silent: true }).stdout.trim()
  const email = shell.exec('git config user.email', { silent: true }).stdout.trim()
  return username ? `${username} <${email}>` : ''
}

async function getDeps() {
  return (await fetch(DEPS_URL)).json()
}

export default async function () {
  /* import ecmascript modules */
  shell.echo(blue('KotoriBot - Cross-platform Chatbot Framework'))

  const projectNameOrigin = await input({ message: 'Input module name', default: DEFAULT_PROJECT_NAME })
  const projectDescription = await input({ message: 'Input module description', default: DEFAULT_PROJECT_DESCRIPTION })
  const projectAuthor = await input({ message: 'Input author name', default: getGitName() ?? DEFAULT_PROJECT_AUTHOR })
  const projectStyle = await confirm({ message: 'Do you want to use decorators style', default: true })

  const projectName = String(projectNameOrigin).trim().toLocaleLowerCase().replaceAll(' ', '-')
  const workspaceDir = resolve(process.cwd(), projectName)
  const modulesDir = resolve(workspaceDir, './modules', projectName)
  const workspacePkgFile = resolve(workspaceDir, 'package.json')
  const modulePkgFile = resolve(modulesDir, 'package.json')
  const moduleReadmeFile = resolve(modulesDir, 'README.md')

  if (existsSync(workspaceDir) || existsSync(resolve(process.cwd(), TEMPLATE_REPO_NAME))) {
    shell.echo(red('Error: dir already existed'))
    shell.exit()
  }

  if (!shell.which('git')) {
    shell.echo(red('Error: git not found'))
    shell.exit()
  }

  shell.echo(white(`Workspace project in ${workspaceDir}`))

  shell.exec(`git clone ${TEMPLATE_REPO}`)
  shell.mv(resolve(process.cwd(), TEMPLATE_REPO_NAME), workspaceDir)
  shell.mv(resolve(workspaceDir, './modules/my-project'), modulesDir)

  shell
    .cat(resolve(modulesDir, `src/index_${projectStyle ? 'decorators' : 'exports'}.ts`))
    .to(resolve(modulesDir, 'src/index.ts'))
  shell.rm('-f', resolve(modulesDir, 'src/index_*.ts'))

  shell.rm('-r', resolve(workspaceDir, '.git'))
  shell.exec('git init')

  const deps = await getDeps()
  const workspacePkgJson = require(workspacePkgFile)
  workspacePkgJson.author = projectAuthor
  workspacePkgJson.dependencies = deps
  writeFileSync(workspacePkgFile, JSON.stringify(workspacePkgJson, null, 2))
  const modulePkgJson = require(modulePkgFile)
  modulePkgJson.name = projectName
  modulePkgJson.description = projectDescription
  modulePkgJson.author = projectAuthor
  modulePkgJson.peerDependencies['kotori-bot'] = deps['kotori-bot']

  writeFileSync(
    moduleReadmeFile,
    readFileSync(moduleReadmeFile)
      .toString()
      .replaceAll('module-name', projectName)
      .replaceAll('module-description', projectDescription)
  )

  /* ending */
  shell.echo(
    `${yellow('Everything is ready！')}\nNow run:\n${green(`\n  cd ${projectName}\n  pnpm install\n  pnpm run format\n  pnpm run dev`)}`
  )
}
