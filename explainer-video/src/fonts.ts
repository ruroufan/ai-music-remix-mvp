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
      "+AEG–—’“”…←→≠▶◀★♥✓✕、。《》「」【】一丁万三上下不与丑且世业东丝两严个中丹为主举久么义之乎乐也习乡书买乱了争事二于亏云五亚些交享京亲人什仅今介从他仗付代令以们仰件价任份企伊伏休众优会伟传伤伦伪伯估伴但位低住体何余作你使例依侣便保信修倒候倡倦债值假偏做停健偷傅傲像儿允先光克兔入全八公六兰关兴其具典养内册再冒写冰冲决冷净准几凭凯出击刀刁刃分切刍划列刘则刚创删判利别到制刷刺刻削前剖剥剧剩力办功加务动助努劲劳勇勒勤包化匙匠匹医十千升午半华协卑单卖南博卡卦卫即却历厉压原去又友双反发叔取受变叙叛口古句另只可台史号司吃各合吉同名后吐向吓吗君吞吧听吵呀呆呈告呢周味呼命和咽品哈响哥哦哪哭哲唯啊啧啪喂善喜喻嗨嗯嘈嘛嘴器四回因团园困国图圈在地场均坐块坡坦垮城基堂堡塞填境壁士声处备复外多夜够大天太失头夸奇奈奖套奠奥女奴奶她好如妈妥始姐委姨威娃娜婚婷嫩子孔字存孟季孤学孩它宇守安完官定实审客宣室害宴家容寄密寇富察寸对导寿封尊小少尔尝尬就尴尼尽局层居屈屏展属山岁岛岩工差己已巴市布师希帕帝带席帮常幅幕干平年并幸庄庆序应底店废度座康延建开异弃弄式张弯弱强当录形影彼往征待很律後徒得循微德心必忆忍志忘忙快念怀态怎怒怕思怠急性怨总恋恤恨恩恭息恰恶恼悄悉悔您悲情惠惦惯想意感愿慌慢慧慰憾懂懒戏成我战截户房所手才打托执扩扰扳找承技把投抗抢护报披抬抵押担拆拉拒拖招拜拟拨择括拼拾拿持挂指按挑挤挥挺损换掉掌掏排探接控推提握搜搞搭摄摆摩摸撤播擅操擦攀攥收改攻放政故效敌教敢散敦数整文斐斑斗料断斯新方施旁旅无既日旦旧早时昂明昏易星昨是显晚晨普景晴智暂暖暗暴更曼曾替最月有朋服朗望期木未末本术朴朵机杂权杉李材束杠条来杯杰松板极析林果枪架柏某柔柜查标树校样根格案档梦梯检棒棵棺楚概模欠次欢欲款歉歌止正此步死段母每比毕毛民气氛水永求汉江沉沙没法波注泪泰洁洗洛洞活派流测济浑浩浪浮海浸涅消淡深清温渴游湿源滑满滤漏演漠漫激火灯灰灵炳炸点烂烘烛烤烦烫热焊焖焙焦然煎照熊熟熬燃爆爱父片版牌牙牛物特犹狂独猎猪率王玩环现珊班球理琢琪瑕甘生用甩由申电画界留番疑疵疼病痘痛痣瘦白百的皆皇皮皱监盘盛目盲直相盼省眉看真眶眼着睡知矫短石矶砍研破砸确碍碗碰磨示社祝神福离秀种科秒秘称移程稍稳稻稿究空穿突窗立站竞竟章端笃笑笔笨第等筑答策签简算管箱箴篇米类粉粗精糊糙系素紧累约级纷纹纽线练组细终经结绕绘给绝统绩绪续维综编缩缴缺罐罗罢罪置美群翻老考者而耗耳聊职联聘聚肉股肤肯胆背胎胜能脂脏脑脸脾腊膏臣自致舍舒舞般舵船良色艺花芽苏苦英茄草荐荡荣荫莉莫获菜萌营萨落著葛蒙蓝薪薰藏虑虚蛳蜜蜡融螺血行衔街衣补表衰衷被装裔西要覆见观规视觉解言计订认讨让训议讯记讲许论设访证评识诉诊词试诗诚话诡该语误说请诸诺读课谁调谈谊谋谓谕谟谢谦谱象豪貌负财责败账货贬购贴贷费贼赌赏赖赛赞赢走起超越趣足跑距路跳踏蹈蹦身躲车转轮软轰轻较辆辑输辞辣辩边达过迈运近还这进远连迟迦迪追退送适逃选逐递途通逛逝逞速造逻逼遇遍道遗遣遮避邀那邮邻郭都配酪酵酷酸醒采释里重量金鉴针钟钥钱铁银销锁锅错键镇镜长门问闲间闹闺闻队阳阴阶阿附际陈限除险陪陶随隐隔障隶难雀雄雅集雨雪需震露青静非靠面鞭韩音页顶项顺须顾顿预频颗题颜颠风食餐饭饰馆首香马驱驾骄验骑骗高魂鱼鲁鲍鲜鸠鸡鹏麦麻黄黎黑默齿龄！（），：；？～",
  ),
).join("");

const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 :·.-/…ÉÀØ✓✕∞≠×%?=↑“”’—ΤΑΕΙΣΥΟΝÈÜÄ!,□█░♥▶●☐✗∴∵≠";
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
