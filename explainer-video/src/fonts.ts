import { continueRender, delayRender } from "remotion";
import "@fontsource/noto-serif-sc/400.css";
import "@fontsource/noto-serif-sc/700.css";
import "@fontsource/noto-serif-sc/900.css";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/700.css";
import "@fontsource/noto-sans-sc/900.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/zcool-kuaile/400.css";
import "@fontsource/caveat/400.css";
import "@fontsource/caveat/700.css";
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
      "自爱心自尊心优越感成绩单我需要满足站稳周末有人一起吃饭吗你撤回了一条消息分钟前对话判决被告人自由名校名表名牌精修照头衔年薪我们当年在毕竟是不经意昨天今天低着头昂着头同一种人藏贴金学试错长大变强显得强确认外卖附近又是它轻食沙拉黄焖鸡米饭麻辣烫寿司拼盘牛肉面螺蛳粉酸菜鱼汉堡套餐烤肉饭云吞面麻辣香锅披萨辞呈会议室天花板走过的路没选的如果当时损失只此一次回到那里再痛事情本身已发生那句话重想未来反省昨天今天前一晚熬夜第一次上台很紧张信息不足理解当时现在尽力了后悔双重不幸伦理学身边的人孤独感体温刺痛不太冷痛豪猪困境挤在一起没人哈哈真的假干杯笑死下次再约对+散场回家路通讯录位联系人拨号阿杰安包子陈经理大学室友刁老师房东健身教练快递小哥老张李医生刘姐妈前同事球友物业林周表哥装修师傅相亲爱一家未读其实我最近有点表情已发送合群在场真正你缺席陪伴自己新消息直播开始了条推荐给语音通话聊人生智慧只有独处时才能成为谁热爱也就自由被剩选吃饭散步待整个下午座江边不敢当我很一般的过奖运气好而已伪装谦虚骄傲人性解剖师常常只是种假顺从让臣服计谋放低抬高箴言集反面这次全靠他你难受随便弄弄等待夸奖厉害做得真好今天看哪里自动回复棒不行超目标达成面具后满意走向回应贬低确认当真直接的累上天平谢够明天今天还剩拖延生活最大障碍是期待寄望于却失去论命之短暂懒想起那份报告惦记什么都不一直房间整洁度进度交下周开始健身一定个月再说吧明早效率字金钱有价时小心疼取快递回消息年度毕业论文人生规划程长怕做好门开始我的真实水平只能这样永远打分想象中後勇气着急后天大抵押明年岁债欠款浪费得太多塞涅卡说报复性熬夜困意不要劳动者之外之中才感到自在则马克思手稿自制力差不甘心再等剩余到家已刷集播完下一秒后自动播放看明早关灯没做工作消息会议老板群聊别人的要求没有人来找你一天通勤家务属于自己分钟小时抢回来睡觉结束深夜肯更累圈来自健康精力白留给段午饭不回路稍怀旧来路清楚前方一片模糊那辆单车高三首歌岁旧时光日记克尔凯郭尔向后理解却必须向前生活原片修饰暖色柔光烦恼无聊遗憾某个周二最好的眼眶湿度年A面当时现在回看累死了老街面馆其实挺难吃亲切剧终已结束看得懂过去结局已定当下还在发生未知不安职业城市成为可能那时你错过此刻普通天周四怀念年龄焦虑害怕变老越来越早到病德国海德格尔著名概念向死而生衰老意识有限悲观恰恰真正地活同龄人结婚买房开始慌过次就像被宣判必须做完件事条对照常人之中别几升职照着同张时间表落后于写好不怕流逝白白忙追进度问想要什么跑得快方向正视走出属于一生变慢用活成AGE存款五十万冰岛看极光学会乐器全马读完百本书创业孩子已完成毕年薪三表哥小林老同学前事闺蜜室友第二套发财务自由博主移民长总监邻居胎堂姐岁标准统适用速度出终点所以发光每都算数无所谓刚新家钥匙到手感恩提车又老目达满意秒受影响钟度心率内耗什么都没做却已经累整天这个时代最隐秘王阳明五百年前人须在事上磨方立得住传习录想得太多少条消息改遍才敢发出去电话心里预演下午还没生脑子输学曾问静坐好遇乱怎么办只知道养不功颗从来想象打架现实有千种困难永远比真仗步往前走破山中贼易难法再而那出这就练安定过程今日完成精力万他回呢会很尴尬被拒绝是气错要等写行吗肯定搞砸草稿李老师您好打扰请教不好意思其实方便看就好王经理喂如果说没空那我直接拒未拨中模拟输实际体力对手存在已打完脑内的仗前进步刀石从未用过次去做送通话事练重来还没准备好伏尔泰完美是好的敌人标准高要求严做得最好人迟迟不肯动手开头第二段天画架颜料笔数位板了张简历格式投递想象里瑕疵局限真正水平我们在准备什么那件事永远不会失败自己还没来你等别人越往后越好做完还不错脑子一笔越做他们看错了你真厉害做得太好了这次多亏你是最棒的伯特兰罗素英国哲学家确信怀疑已知未知边界笃定不安谦卑懂得少多世界很小更认知颠覆我们通常以为自己不够好因为知道得心理学历史经济学哲学编程艺术看见的升职通知恭喜运气好报告季度只记得考试期末下一次冒名顶替综合征缺点展示出优点拖延粗心嘴笨那次失误半途而废不够自信熬夜没想清楚加薪获奖精修照片说走就走旅行健身打卡完美方案发言舞台另一层意思清醒代价停下理由更大的★磨皮美白瘦脸大眼发布镜子让鲍德里亚法国哲学家拟像真实在现代社会比更认知颠覆容貌焦虑我们通常以为不够好看你比较对象不存在分信息流视频通话原相机无美颜毛孔邀请挂断接听我难受原本无灯光滤镜修图现实中匹配人正常今日屏幕使用雀斑黑眼圈细纹痘痘痣检测到处错误修出来的里和它好女神求绝了皮肤爱神颜精致会老累长笑哭被记住表情温度记忆♥你好呀久不见最近怎么样哈是吗我也那改天再约嗯的拜演练托马斯吉洛维奇美国心理学家康奈尔大学聚光灯效应总是高估别人对自己关注以为实际上低标签颠覆因为害怕被看见电梯会议深夜嗨假装很忙觉得咽回去刚才不皱眉了放尴尬恤实验过气歌星大概一半注意到真正审视记住观众担心说错别看",
  ),
).join("");

const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 :·.-/…ÉÀØ✓✕∞≠×%?=↑“”";
const handle = delayRender("Loading fonts");
Promise.all([
  ...["400", "700", "900"].map((w) => document.fonts.load(`${w} 48px "Noto Serif SC"`, glyphs)),
  ...["400", "700", "900"].map((w) => document.fonts.load(`${w} 48px "Noto Sans SC"`, glyphs)),
  document.fonts.load(`400 20px "JetBrains Mono"`, latin),
  document.fonts.load(`400 48px "ZCOOL KuaiLe"`, glyphs),
  document.fonts.load(`400 48px "Caveat"`, latin),
  document.fonts.load(`700 48px "Caveat"`, latin),
])
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });
