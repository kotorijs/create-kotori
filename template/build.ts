import build from 'kotori-bot/lib/dev/build'
import { CONFIG_NAME, loadConfig } from 'kotori-bot'
import { resolve } from 'node:path'

build(
  {
    ...((loadConfig(resolve(__dirname, CONFIG_NAME), 'toml').build as object) ?? {}),
    ignoreError: process.argv.includes('--ignoreError'),
    types: process.argv.includes('--types'),
    onlyTypes: process.argv.includes('--onlyTypes'),
    silent: process.argv.includes('--silent')
  },
  process.argv.filter((arg) => !arg.startsWith('-'))[2]
)
