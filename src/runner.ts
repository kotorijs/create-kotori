import { cpSync, existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { DEFAULT_PROJECT_AUTHOR, DEFAULT_PROJECT_DESCRIPTION, DEFAULT_PROJECT_NAME, DEPS_URL } from './const'
import shell from 'shelljs'
import { blue, green, red, white, yellow } from 'colorette'
import { input, confirm } from '@inquirer/prompts'

export default async function () {
  shell.echo(blue('KotoriBot - Cross-platform Chatbot Framework'))

  const projectNameOrigin = await input({ message: 'Input module name', default: DEFAULT_PROJECT_NAME })
  const projectDescription = await input({ message: 'Input module description', default: DEFAULT_PROJECT_DESCRIPTION })
  const projectAuthor = await input({
    message: 'Input author name',
    default:
      ((username) =>
        username ? `${username} <${shell.exec('git config user.email', { silent: true }).stdout.trim()}>` : '')(
        shell.exec('git config user.name', { silent: true }).stdout.trim()
      ) ?? DEFAULT_PROJECT_AUTHOR
  })
  const projectStyle = await confirm({ message: 'Do you want to use decorators style', default: true })
  const projectName = String(projectNameOrigin).trim().toLocaleLowerCase().replaceAll(' ', '-')
  const workspaceDir = resolve(process.cwd(), projectName)
  const [modulesDir, modulesResDir] = [projectName, `${projectName}-res`].map((name) =>
    resolve(workspaceDir, './modules', name)
  )

  if (existsSync(workspaceDir)) {
    shell.echo(red('Error: dir already existed'))
    shell.exit()
  }

  if (!shell.which('git')) {
    shell.echo(red('Error: git not found'))
    shell.exit()
  }

  shell.echo(white(`Workspace project in ${workspaceDir}`))

  cpSync(resolve(__dirname, '../template/'), workspaceDir, { recursive: true })
  ;[
    ['./modules/my-project', modulesDir],
    ['./modules/my-project-res', modulesResDir]
  ].map(([source, target]) => renameSync(resolve(workspaceDir, source), target))

  shell
    .cat(resolve(modulesDir, `src/index_${projectStyle ? 'decorators' : 'exports'}.tsx`))
    .to(resolve(modulesDir, 'src/index.tsx'))
  shell.rm('-f', resolve(modulesDir, 'src/index_*.tsx'))

  shell.exec('git init')
  ;((deps) =>
    [
      resolve(workspaceDir, 'package.json'),
      resolve(modulesDir, 'package.json'),
      resolve(modulesResDir, 'package.json')
    ].map((dir) =>
      writeFileSync(
        dir,
        JSON.stringify(
          ((origin) => ({
            ...origin,
            author: projectAuthor,
            ...(dir === resolve(workspaceDir, 'package.json')
              ? {
                  dependencies: deps
                }
              : {
                  name: `kotori-plugin-${projectName}${dir === resolve(modulesResDir, 'package.json') ? '-res' : ''}`,
                  peerDependencies: { ...origin.peerDependencies, 'kotori-bot': deps['kotori-bot'] }
                })
          }))(require(dir)),
          null,
          2
        )
      )
    ))(await (await fetch(DEPS_URL)).json())
  ;[resolve(modulesDir, 'README.md'), resolve(modulesResDir, 'README.md')].map((dir) =>
    writeFileSync(
      dir,
      readFileSync(dir)
        .toString()
        .replaceAll('module-name', projectName)
        .replaceAll('module-description', projectDescription)
    )
  )

  shell.echo(
    `${yellow('Everything is ready！')}\nNow run:\n${green(`\n  cd ${projectName}\n  pnpm install\n  pnpm run dev`)}`
  )
}
