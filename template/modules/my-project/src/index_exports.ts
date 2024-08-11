import { Context, none, Tsu } from 'kotori-bot';

export const lang = [__dirname, '../locales'];

export const config = Tsu.Object({
  config1: Tsu.Number().range(0, 10).default(0),
  config2: Tsu.Boolean().default(false),
  config3: Tsu.Union([Tsu.Literal('on'), Tsu.Literal('off')]).default('off')
});

type Config = Tsu.infer<typeof config>;

export const inject = ['database'];

export function main(ctx: Context, config: Config) {
  none(config);

  ctx.on('ready', async () => {
    /* ... */
  });

  ctx.on('on_group_decrease', (session) => {
    session.quick([
      session.userId === session.operatorId ? '%target% 默默的退出了群聊' : '%target% 被 %operator% 制裁了...',
      {
        target: session.userId,
        operator: session.operatorId
      }
    ]);
  });

  ctx.midware((next, session) => {
    const s = session;
    if (s.message.startsWith('/说') || s.message.includes('/说')) {
      s.message = `${s.api.adapter.config['command-prefix']}echo`;
    }
    next();
  }, 10);

  ctx
    .command('echo <content> [num:number=3]')
    .action((data, session) => {
      ctx.logger.debug(data, data.args[0]);
      ctx.logger.debug(session.message);
      return [`返回消息：~%message%`, { message: data.args[0] }];
    })
    .alias('print');

  ctx.regexp(/^(.*)#print$/, (match) => match[1]);
}
