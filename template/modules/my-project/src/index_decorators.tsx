import { Tsu, type CommandAction, plugins, KotoriPlugin, UserAccess, type SessionMsg } from 'kotori-bot'

const plugin = plugins([__dirname, '../'])

@plugin.import
export class YourPlugin extends KotoriPlugin<Tsu.infer<typeof YourPlugin.schema>> {
  @plugin.schema
  public static schema = Tsu.Object({
    config1: Tsu.Number().range(0, 10).default(0),
    config2: Tsu.Boolean().default(false),
    config3: Tsu.Union(Tsu.Literal('on'), Tsu.Literal('off')).default('off')
  })

  @plugin.inject
  public static inject = ['database']

  @plugin.on({ type: 'ready' })
  public async onReady() {
    /* ... */
  }

  @plugin.midware({ priority: 10 })
  public async midware(next: () => void, session: SessionMsg) {
    const s = session
    if (s.message.startsWith('/说') || s.message.includes('/说')) {
      s.message = `${s.api.adapter.config['command-prefix']}echo`
    }
    next()
  }

  @plugin.command({
    template: 'echo <content> [num:number=3]',
    access: UserAccess.ADMIN,
    options: [['I', 'interactive:boolean']]
  })
  public async echo({ args }: Parameters<CommandAction>[0], _session: SessionMsg) {
    this.ctx.logger.debug(args)
    return (
      <format template="返回消息：{0}">
        <text>{args[0] as string}</text>
      </format>
    )
  }

  @plugin.regexp({ match: /^(.*)#print$/ })
  public static print(match: RegExpExecArray) {
    return match[1]
  }

  @plugin.task({ cron: '0/10 * * * * *' })
  public task() {
    this.ctx.logger.info('task run!')
  }
}
