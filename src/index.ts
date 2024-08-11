import { cac } from 'cac'
import runner from './runner'

const program = cac()

program.version(require('../package.json').version, '-v, --version')
program.help()

program.command('').action(() => runner().then())

program.parse()
