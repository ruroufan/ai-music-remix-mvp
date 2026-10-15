import { continueRender, delayRender } from "remotion";
import "@fontsource/noto-serif-sc/400.css";
import "@fontsource/noto-serif-sc/700.css";
import "@fontsource/noto-serif-sc/900.css";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/700.css";
import "@fontsource/noto-sans-sc/900.css";
import "@fontsource/jetbrains-mono/400.css";
import { EPISODES } from "./episodes/registry";

// The font is split into many unicode-range files that load lazily. Block the
// first frame until every glyph the videos use is downloaded, otherwise early
// frames render in a fallback font.
const glyphs = Array.from(
  new Set(
    Object.values(EPISODES)
      .flatMap(({ episode, brand }) => [...episode.script.flatMap((s) => s.lines.map((l) => l.text)), ...Object.values(brand)])
      .join("") +
      // words drawn by the scenes themselves
      "自爱心自尊心优越感成绩单我需要满足站稳周末有人一起吃饭吗你撤回了一条消息分钟前对话判决被告人自由名校名表名牌精修照头衔年薪我们当年在毕竟是不经意昨天今天低着头昂着头同一种人藏贴金学试错长大变强显得强确认外卖附近又是它轻食沙拉黄焖鸡米饭麻辣烫寿司拼盘牛肉面螺蛳粉酸菜鱼汉堡套餐烤肉饭云吞面麻辣香锅披萨辞呈会议室天花板走过的路没选的如果当时损失只此一次回到那里再痛事情本身已发生那句话重想未来反省昨天今天前一晚熬夜第一次上台很紧张信息不足理解当时现在尽力了后悔双重不幸伦理学身边的人孤独感体温刺痛不太冷痛豪猪困境挤在一起没人哈哈真的假干杯笑死下次再约对+散场回家路通讯录位联系人拨号阿杰安包子陈经理大学室友刁老师房东健身教练快递小哥老张李医生刘姐妈前同事球友物业林周表哥装修师傅相亲爱一家未读其实我最近有点表情已发送合群在场真正你缺席陪伴自己新消息直播开始了条推荐给语音通话聊人生智慧只有独处时才能成为谁热爱也就自由被剩选吃饭散步待整个下午座江边不敢当我很一般的过奖运气好而已伪装谦虚骄傲人性解剖师常常只是种假顺从让臣服计谋放低抬高箴言集反面这次全靠他你难受随便弄弄等待夸奖厉害做得真好今天看哪里自动回复棒不行超目标达成面具后满意走向回应贬低确认当真直接的累上天平谢够明天今天还剩拖延生活最大障碍是期待寄望于却失去论命之短暂懒想起那份报告惦记什么都不一直房间整洁度进度交下周开始健身一定个月再说吧明早效率字金钱有价时小心疼取快递回消息年度毕业论文人生规划程长怕做好门开始我的真实水平只能这样永远打分想象中後勇气着急后天大抵押明年岁债欠款浪费得太多塞涅卡说",
  ),
).join("");

const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 :·.-/…ÉÀØ✓✕∞≠";
const handle = delayRender("Loading fonts");
Promise.all([
  ...["400", "700", "900"].map((w) => document.fonts.load(`${w} 48px "Noto Serif SC"`, glyphs)),
  ...["400", "700", "900"].map((w) => document.fonts.load(`${w} 48px "Noto Sans SC"`, glyphs)),
  document.fonts.load(`400 20px "JetBrains Mono"`, latin),
])
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });
