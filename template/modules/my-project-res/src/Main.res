open Kotori
open Msg
open Session
open Ctx

let inject = ["browser"]

@scope("logger") @send external logger: (context, 'a) => unit = "debug"
@send external task: (context, string, unit => unit) => unit = "task"

type config = {
  times: int,
  duration: int,
  steps: int,
  minNum: int,
  maxNum: int,
}

let config =
  [
    ("times", Tsu.int()->Tsu.default(7)),
    ("duration", Tsu.int()->Tsu.default(180)),
    ("steps", Tsu.int()->Tsu.default(3)),
    ("minNum", Tsu.int()->Tsu.default(1)),
    ("maxNum", Tsu.int()->Tsu.default(10)),
  ]
  ->Dict.fromArray
  ->Tsu.object

let main = (ctx: context, config: config) => {
  ctx->on(
    #ready(
      () => {
        ctx->logger(config)
      },
    ),
  )

  ctx
  ->Cmd.make("greet - get a greeting")
  ->Cmd.action_async(async (_, session) => {
    let res =
      await ctx->Http.get("https://api.hotaru.icu/ial/hitokoto/v2/?format=text", Js.Undefined)
    <Text>
      {switch res->Type.typeof {
      | #string => session->format("Greet: \n{0}", [res->Kotori.Utils.toAny])
      | _ => "Sorry, I cannot get a greeting right now."
      }}
    </Text>
  })
  ->Cmd.help("Get a greeting from hotaru.icu")
  ->Cmd.scope(#all)
  ->Cmd.alias(["hi", "hey", "hello"])
  ->ignore

  ctx
  ->Cmd.make("res [saying=functional]")
  ->Cmd.action_async(async ({args}, session) => {
    let userId = switch session.userId {
    | Some(userId) => userId
    | None => "Unknown"
    }
    <Seg>
      <Text> {"Hello "} </Text>
      <Mention userId />
      <Br />
      <Text>
        {switch args {
        | [String(saying)] => session->format("Greet: \n{0}", [saying])
        | _ => "Sorry, I cannot get a greeting right now."
        }}
      </Text>
      <Seg>
        <Text> {"he is a example image"} </Text>
        <Image src="https://i.imgur.com/y5y5y5.png" />
      </Seg>
    </Seg>
  })
  ->ignore

  ctx
  ->on(
    #on_group_increase(
      async session => {
        switch session.userId {
        | Some(userId) if userId !== session.api.adapter.selfId =>
          session
          ->quick(
            <Seg>
              <Text> {"welcome to here!"} </Text>
              <Mention userId />
            </Seg>,
          )
          ->ignore
        | _ => ()
        }
      },
    ),
  )
  ->ignore

  ctx
  ->task("0/10 * * * * *", () => {
    ctx->logger("hi! this message is from rescript plugin!")
  })
  ->ignore
}
