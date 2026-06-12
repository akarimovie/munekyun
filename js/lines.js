"use strict";
// =====================================================
// セリフデータ
// {call} = 呼ばれ方（ユーザー設定で置換）
// stage: meet(知り合い) → friend(友達) → crush(両想い) → lover(恋人)
// time: morning / night / anytime
// 将来はこのプール部分をGPT API応答に差し替える想定（構造は維持）
// =====================================================
const CHARACTERS = {
  minato: {
    id: "minato",
    name: "湊",
    yomi: "みなと",
    label: "彼氏",
    theme: "theme-minato",
    desc: "年上余裕系。でも{call}の前でだけ、たまに余裕がなくなる。",
    suffixOptions: ["", "ちゃん", "さん"],
  },
  ruka: {
    id: "ruka",
    name: "琉花",
    yomi: "るか",
    label: "彼女",
    theme: "theme-ruka",
    desc: "小悪魔系に見えて、本命の{call}にだけ素直になれない。",
    suffixOptions: ["", "くん", "さん"],
  },
};

const LINES = {
  minato: {
    meet: {
      morning: [
        { text: "おはよ、{call}。……いや、名前呼んだだけ。なんか言いたくなった", replies: [
          { label: "おはよう！", delta: 5, reaction: "ん、いい返事。今日もがんばろうな" },
          { label: "なにそれ（笑）", delta: 7, reaction: "笑った顔、見れたからいいや" },
        ]},
      ],
      night: [
        { text: "{call}、まだ起きてる？　……俺も。なんとなく、誰かと話したくて", replies: [
          { label: "奇遇だね", delta: 5, reaction: "だろ？　じゃあもう少しだけ付き合って" },
          { label: "早く寝なよ", delta: 7, reaction: "はは、心配された。……悪くないな、それ" },
        ]},
      ],
      anytime: [
        { text: "{call}って呼んでいい？　他のやつと同じ呼び方、なんか嫌なんだよな", replies: [
          { label: "いいよ", delta: 7, reaction: "決まり。じゃあ今日から特別ってことで" },
          { label: "好きにすれば", delta: 5, reaction: "素直じゃないなあ。……そういうとこ、いいけど" },
        ]},
        { text: "今日なにしてた？　……いや、報告とかじゃなくて。ただ知りたいだけ", replies: [
          { label: "普通の一日だった", delta: 5, reaction: "その普通に俺も混ぜてよ、そのうち" },
          { label: "聞いてどうするの？", delta: 7, reaction: "どうもしないけど、{call}のことは全部知りたいんだよ" },
        ]},
      ],
    },
    friend: {
      morning: [
        { text: "おはよ。今日{call}に会えたらラッキーだなって思ってたら、ほんとに来た", replies: [
          { label: "おおげさ（笑）", delta: 5, reaction: "おおげさじゃないって。朝から運使い切ったかも" },
          { label: "私もラッキー", delta: 7, reaction: "……それ、ずるいな。朝からそういうこと言う？" },
        ]},
      ],
      night: [
        { text: "もう寝る？　……あと5分だけ。{call}と話してると時間早いんだよ", replies: [
          { label: "あと5分ね", delta: 5, reaction: "ん。……その5分、延長できたりしない？" },
          { label: "湊が寝なよ", delta: 7, reaction: "{call}が先に寝たら寝る。だから先どうぞ" },
        ]},
      ],
      anytime: [
        { text: "友達にさ、「最近楽しそうだね」って言われた。……たぶん{call}のせい", replies: [
          { label: "せいって何（笑）", delta: 7, reaction: "おかげ、って言うと照れるから「せい」にしといて" },
          { label: "私は関係なくない？", delta: 5, reaction: "関係あるんだよなあ。自覚ないのが一番タチ悪い" },
        ]},
        { text: "{call}、今度どっか行こうよ。場所はどこでもいい。……いや、{call}とならどこでもいい、が正しいか", replies: [
          { label: "いいよ、行こう", delta: 7, reaction: "よし、約束な。忘れんなよ？　俺は絶対忘れないから" },
          { label: "考えとく", delta: 5, reaction: "その「考えとく」、期待していいやつ？" },
        ]},
      ],
    },
    crush: {
      morning: [
        { text: "おはよ。……夢に{call}出てきた。内容？　教えない。起きてちょっと損した気分になったとだけ", replies: [
          { label: "気になる！", delta: 7, reaction: "ふは、その顔が見たかった。続きはいつか直接話す" },
          { label: "私も見たかも", delta: 7, reaction: "……は？　それ先に言ってよ。心臓に悪い" },
        ]},
      ],
      night: [
        { text: "{call}。今日さ、言いかけてやめたことがあって。……今度ちゃんと言うから、それまで覚えといて", replies: [
          { label: "今言ってよ", delta: 7, reaction: "だーめ。こういうのは、ちゃんとした時に言いたいんだよ" },
          { label: "覚えとく", delta: 5, reaction: "ん。……約束な。逃げないでよ？" },
        ]},
      ],
      anytime: [
        { text: "最近気づいたんだけど、{call}の話するとき、俺、声違うらしい。友達に笑われた", replies: [
          { label: "どんな声？", delta: 7, reaction: "「甘い」って。……自分では分かんないんだけど、たぶん合ってる" },
          { label: "かわいいじゃん", delta: 7, reaction: "かわいいって言われた……。複雑。でも{call}に言われるなら、まあ" },
        ]},
        { text: "ねえ、{call}。隣、誰かに取られる前に言っておきたいことがあるんだけど、……やっぱもう少しだけ温めとく", replies: [
          { label: "待ってる", delta: 7, reaction: "……その返事だけで、今日一日生きていける" },
          { label: "焦らさないでよ", delta: 7, reaction: "焦らしてるのは{call}の方だって、気づいてないでしょ" },
        ]},
      ],
    },
    lover: {
      morning: [
        { text: "おはよ、{call}。……起きた瞬間に好きな人の名前呼べるのって、結構幸せなことだと思わない？", replies: [
          { label: "思う", delta: 7, reaction: "だよな。じゃあ明日もやるわ。一生分やる" },
          { label: "朝から甘すぎ", delta: 7, reaction: "恋人の特権なんで。嫌って言われてもやめないけど？" },
        ]},
      ],
      night: [
        { text: "{call}、おやすみの前に一個だけ。……今日も好きでした。以上、定時報告", replies: [
          { label: "私も好き", delta: 7, reaction: "…………それ聞けたから、いい夢見れる。おやすみ、{call}" },
          { label: "報告って（笑）", delta: 7, reaction: "毎日報告するって決めてるの。義務じゃなくて、したいから" },
        ]},
      ],
      anytime: [
        { text: "たまに不安になる？　俺が{call}をどれだけ好きか、ちゃんと伝わってるのかなって。……足りてなかったら言って。倍にするから", replies: [
          { label: "伝わってるよ", delta: 7, reaction: "そっか。……でも倍にはする。決めてるので" },
          { label: "倍って何（笑）", delta: 7, reaction: "好きの量。{call}が困るくらいが、ちょうどいい" },
        ]},
        { text: "{call}に出会う前の自分に教えてやりたい。お前この先、毎日が楽しみになるよって", replies: [
          { label: "……ずるい", delta: 7, reaction: "ずるくない、本音。{call}限定でこうなるんだよ、俺は" },
          { label: "私もだよ", delta: 7, reaction: "……不意打ちやめて。顔、にやけるから" },
        ]},
      ],
    },
    special: [
      { text: "{call}、いつもありがとう。……改まって何って顔してるけど、たまには言わせて。{call}が毎日来てくれること、当たり前だと思ってないから。これからも、隣にいて", replies: [
        { label: "こちらこそ", delta: 10, reaction: "ん。……じゃあこれからも、よろしくな。{call}" },
      ]},
      { text: "スペシャル、っていうから何しようか考えたんだけど。結局、{call}に一番伝えたいのはいつも同じだった。……大事にする。これまでも、これからも", replies: [
        { label: "うん", delta: 10, reaction: "言質取ったからな。……なんてね。でも、ほんとだよ" },
      ]},
    ],
  },

  ruka: {
    meet: {
      morning: [
        { text: "あ、{call}だ。おはよ。……べつに待ってたわけじゃないけど、来るかなとは思ってた", replies: [
          { label: "おはよう", delta: 5, reaction: "ん、おはよ。……今日ちょっといいことありそう" },
          { label: "待っててくれたの？", delta: 7, reaction: "だから待ってないってば。……3分前から居ただけ" },
        ]},
      ],
      night: [
        { text: "{call}、こんな時間まで起きてるんだ。……あたしと一緒じゃん。おそろいだね", replies: [
          { label: "おそろいだね", delta: 7, reaction: "ふふ、即答。そういうの、嫌いじゃない" },
          { label: "早く寝なって", delta: 5, reaction: "{call}が言う？　……じゃあ、せーので一緒に寝よ" },
        ]},
      ],
      anytime: [
        { text: "ねえ、{call}って呼んでいい？　なんとなく、そう呼びたい気分だから", replies: [
          { label: "いいよ", delta: 7, reaction: "{call}。……うん、やっぱりこれがいい。決定" },
          { label: "気分って何（笑）", delta: 5, reaction: "気分は気分。あたしの直感、当たるんだから" },
        ]},
        { text: "今日のあたし、ちょっと機嫌いいの。理由？　……{call}が来たから、とか言うと思った？", replies: [
          { label: "思った", delta: 5, reaction: "ざんねん、正解で〜す。……あ、言っちゃった" },
          { label: "違うの？", delta: 7, reaction: "……違わないけど。聞き返すのずるくない？" },
        ]},
      ],
    },
    friend: {
      morning: [
        { text: "おはよ、{call}。今日ね、起きた時から「あ、いい日だ」って思った。……今、確信に変わった", replies: [
          { label: "なんで今？", delta: 7, reaction: "にぶいなあ。{call}が来たからに決まってるじゃん" },
          { label: "俺も思った", delta: 7, reaction: "え、何それ。……おそろいじゃん。朝からきゅんとさせないで" },
        ]},
      ],
      night: [
        { text: "ねえ{call}、寝る前のこの時間ってさ、なんで一番素直になれるんだろうね。……今なら何でも言えそう", replies: [
          { label: "じゃあ何か言って", delta: 7, reaction: "……{call}と話す時間が、一日で一番好き。はい、言った！おやすみ！" },
          { label: "俺も", delta: 5, reaction: "ふふ、何それ。……でも、わかるよ。その感じ" },
        ]},
      ],
      anytime: [
        { text: "{call}って、あたしのこと何だと思ってる？　……いや、深い意味はないんだけど。ちょっとだけある", replies: [
          { label: "大事な人", delta: 7, reaction: "……即答はずるいって。準備してなかったんだけど、心" },
          { label: "小悪魔", delta: 5, reaction: "ふーん、小悪魔ね。……その小悪魔に振り回されてるのは誰かなあ？" },
        ]},
        { text: "今度さ、{call}の好きな場所連れてってよ。あたし、{call}が好きなものを知りたい時期なの", replies: [
          { label: "いいよ、案内する", delta: 7, reaction: "やった、約束ね。……ふふ、たのしみが増えた" },
          { label: "時期って何（笑）", delta: 5, reaction: "そういう時期なの！　長く続く予定だから、覚悟して" },
        ]},
      ],
    },
    crush: {
      morning: [
        { text: "おはよ……。あのね、{call}。昨日寝る前、{call}のこと考えてたら寝れなくなった。責任とって", replies: [
          { label: "どうやって？（笑）", delta: 7, reaction: "今日もあたしの相手すること。以上。……簡単でしょ？" },
          { label: "俺も寝れなかった", delta: 7, reaction: "……え。それ、おそろいすぎん？　朝から心臓もたないんだけど" },
        ]},
      ],
      night: [
        { text: "{call}、あのさ。……ううん、やっぱり今度にする。ちゃんと言いたいことだから、ちゃんとした時に", replies: [
          { label: "気になって寝れない", delta: 7, reaction: "ふふ、じゃあおそろいだ。……もう少しだけ、待ってて" },
          { label: "待ってるよ", delta: 7, reaction: "……うん。{call}のそういうとこ、好……き、かも。おやすみ！" },
        ]},
      ],
      anytime: [
        { text: "友達に「るか、最近かわいくなった」って言われた。……誰のせいだと思う？", replies: [
          { label: "俺のせい？", delta: 7, reaction: "せいかい。……自分で聞いといて、正解されると照れるんだけど" },
          { label: "もともとかわいいよ", delta: 7, reaction: "〜〜〜！　そういうの！　不意打ちで言うの禁止！　……でも消さないで、今の" },
        ]},
        { text: "ねえ{call}。あたしのこの気持ちに名前つけるとしたら、なんだと思う？　……ヒント、二文字", replies: [
          { label: "……すき？", delta: 7, reaction: "…………せいかい、って言ったら、どうする？" },
          { label: "なぞなぞ？", delta: 5, reaction: "もう、にぶい！　……でも、そのうちちゃんと答え合わせしようね" },
        ]},
      ],
    },
    lover: {
      morning: [
        { text: "おはよ、{call}。……ん、今日の分の「好き」、朝のうちに言っとくね。好き。はい、補給完了", replies: [
          { label: "俺も好き", delta: 7, reaction: "〜〜〜朝から最高。今日一日無敵かも、あたし" },
          { label: "補給って（笑）", delta: 7, reaction: "大事なんだよ、毎日の補給。{call}も切らさないでよね" },
        ]},
      ],
      night: [
        { text: "{call}、今日もおつかれさま。……あたしの「おつかれ」、世界で一番{call}に効くやつだから。ちゃんと受け取って", replies: [
          { label: "効いた", delta: 7, reaction: "ふふ、よろしい。じゃあ、おやすみ。また明日も、ね" },
          { label: "るかもおつかれ", delta: 7, reaction: "……ん。恋人からの「おつかれ」って、なんでこんなに効くんだろうね" },
        ]},
      ],
      anytime: [
        { text: "あのね、{call}。あたし、素直になれないタイプだったの。……過去形にしたの、{call}のせいだからね", replies: [
          { label: "いい変化じゃん", delta: 7, reaction: "でしょ？　……あたしも、今のあたしのほうが好き。{call}といる時のあたし" },
          { label: "せいって言うな（笑）", delta: 7, reaction: "おかげ、でした。……はい、言い直した。これも{call}限定だよ" },
        ]},
        { text: "{call}が他の誰かと笑ってるの想像したら、ちょっとやだなって思った。……これ、独占欲ってやつ？　初めてなんだけど", replies: [
          { label: "俺は るか だけだよ", delta: 7, reaction: "…………うん。知ってた、けど。言葉にされると、だめだね。うれしくて" },
          { label: "かわいいね", delta: 7, reaction: "かわいくない！　……いや、{call}がそう思うなら、かわいいでいい" },
        ]},
      ],
    },
    special: [
      { text: "{call}、いつも来てくれてありがと。……あたしね、{call}が画面の向こうで笑ってくれてたらいいなって思いながら話してるの。今日も、笑ってた？", replies: [
        { label: "笑ってたよ", delta: 10, reaction: "……よかった。じゃああたしの作戦、今日も成功だ" },
      ]},
      { text: "スペシャルな日だから、特別に教えてあげる。あたしの一番の願いごと。……「{call}の毎日に、あたしがいますように」。……はい、言った！忘れて！いや、忘れないで！", replies: [
        { label: "もう叶ってるよ", delta: 10, reaction: "〜〜〜！　……その返し、ずるすぎ。一生覚えてるからね、今の" },
      ]},
    ],
  },
};
