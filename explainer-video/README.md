# explainer-video — 用代码做“踩点”科普视频（Remotion）

画面全部用代码绘制（SVG/CSS 剪影、光、粒子、文字动画），字幕和动作卡在音乐拍子上，背景音乐和音效也由代码合成，没有任何第三方素材。

现在有二十三期（其中人格系列一期）：

| 合成 ID | 期 | 风格 | 节奏 | 时长 |
|---|---|---|---|---|
| `Intj` | **背光观察室 · 人格 No.01《INTJ · 正确》**（分析家组 NT；苏格拉底，柏拉图《申辩篇》） | 同频道风格 + 动感层；核心意象：建筑师画好了一整张蓝图，每个房间都打了 ✓，他独自站在一只写着“我早就想清楚了”的玻璃箱里；最后他走出玻璃箱，用橡皮擦掉蓝图的一角留白，墙上开出一扇门，别人一个个走进他的蓝图 | 120 BPM “industrial”配乐（失真底鼓 + 十六分音符步进贝斯 + 门限军鼓 + 金属撞击 + 冷色主音，安静处是闷音钢琴），C 小调 → 降 E 大调 | ~2:00 |
| `Fomo` | **背光观察室 · 观察 No.22《信息焦虑》**（塞涅卡《道德书简》第二封） | 同频道风格 + 动感层；核心意象：人物被无数块发光的小屏幕包围，屏幕里是世界各地的画面，他的身影越来越淡；他合上手机，屏幕一块块熄灭，他的轮廓重新清晰，对面坐着一个正在说话的人 | 120 BPM “glitchhop”配乐（摇摆的碎拍 + 位压缩军鼓 + 三连音摇摆贝斯 + 通知提示音 + 每小节末拍的卡顿切片，安静处是卡林巴琴），A 小调 → C 大调 | ~1:54 |
| `Emptiness` | **背光观察室 · 观察 No.21《空虚》**（叔本华《作为意志和表象的世界》） | 同频道风格 + 动感层；核心意象：一个巨大的钟摆，人物坐在摆锤上，在“痛苦”和“无聊”两端之间来回荡；最后他从摆锤上跳下来，落在一张点着台灯、摊开书本的桌前 | 120 BPM “frenchhouse”配乐（四拍底鼓 + 全曲跟着底鼓“抽吸”、滤波迪斯科和弦循环、八度跳跃的拨弦贝斯、拍手开镲，安静处是八音盒和钟摆的嘀嗒），E 小调 → G 大调 | ~1:54 |
| `Burnout` | **背光观察室 · 观察 No.20《倦怠》**（韩炳哲《倦怠社会》） | 同频道风格 + 动感层；核心意象：人物在跑步机上奔跑，控制面板上写着“你可以”，速度越来越快；他手里的鞭子抽在自己背上；最后他按下停止键，跑步机慢慢停住 | 120 BPM “breakbeat”配乐（切片碎拍 + 鬼音军鼓 + reese 贝斯 + 锯齿切音 + 警笛线，安静处是竖琴），D 小调 → F 大调 | ~2:00 |
| `Control` | **背光观察室 · 观察 No.19《控制欲》**（爱比克泰德《手册》） | 同频道风格 + 动感层；核心意象：人物双手攥着无数根绳子，另一端连着钟表、天气、别人的身影、计划、命运，绳子越拉越紧；他松开大部分绳子，只留下系在自己身上的那一根 | 120 BPM “acid”配乐（隆隆底鼓 + 拍手 + 开镲 + 303 酸性贝斯 + 和弦切音，安静处是管钟），F 小调 → 降 A 大调 | ~1:52 |
| `Love` | **背光观察室 · 观察 No.18《恋爱脑》**（波伏娃《第二性》） | 同频道风格 + 动感层；核心意象：两个人物，其中一个整个人倚在另一个身上，两人都摇摇晃晃；倚着的那个慢慢站直，两人并肩站稳，地上的影子从一团变成两个 | 120 BPM “dembow”配乐（雷鬼动节奏 + 定音鼓过门 + 次低音 + 马林巴 + 尼龙吉他 + 合成拨弦），E 小调 → G 大调 | ~2:00 |
| `Glass` | **背光观察室 · 观察 No.17《玻璃心》**（马可·奥勒留《沉思录》） | 同频道风格 + **加强动感层**（手持镜头、冲击震动、甩镜转场、前景虚焦光斑视差、速度线、玻璃碎片）；核心意象：一句话化作一支箭飞来，在人物面前停住；箭和人之间出现一道透明的门；人物伸手，没有开门，箭落在地上 | 120 BPM “phonk”配乐（音高牛铃 riff + 失真滑音 808 + 重鼓 + 三连音踩镲 + “ha”人声，安静处是玻璃琴），升 C 小调 → E 大调 | ~1:58 |
| `Social` | **背光观察室 · 观察 No.16《社恐》**（吉洛维奇“聚光灯效应”） | 同频道风格 + 动效层；核心意象：人物头顶一盏刺眼的聚光灯，四周一圈模糊的人影；镜头拉开，原来每个人头顶都有一盏自己的灯，都低着头；最后所有灯熄灭，变成普通的日光 | 120 BPM “electroswing”配乐（四拍底鼓 + 摇摆镲 + 刷子 + 行走低音 + 查尔斯顿钢琴 + 铜管齐奏 + 单簧管），G 小调 → G 大调 | ~1:52 |
| `Appearance` | **背光观察室 · 观察 No.15《容貌焦虑》**（鲍德里亚“拟像比真实更真实”） | 同频道风格 + 动效层；核心意象：手机屏幕里的脸被磨皮、美白、瘦脸、大眼一层层磨平变亮，最后变成一张光滑的石膏雕像脸（呼应原片的石膏头像）；镜子里是带毛孔、雀斑、痣和细纹的真实面孔；最后滤镜关掉、屏幕熄灭，只剩镜子 | 120 BPM “futurebass”配乐（会“泵”的超锯齿和弦 + 半拍鼓 + 人声切片 + 方波拨弦，安静处只有一架毛毡钢琴），降 B 小调 → 降 D 大调 | ~2:10 |
| `Doubt` | **背光观察室 · 观察 No.14《自我怀疑》**（罗素“愚蠢的人总是很确信，聪明的人却满是怀疑”） | 同频道风格 + 动效层；核心意象：两个人物各自站在一个光圈里——小光圈里的人昂着头，大光圈的边缘外是更大的黑暗和一圈问号，里面的人微微低头；最后大光圈里的人抬起头，继续往外走，问号变成星光 | 120 BPM “afrohouse”配乐（四拍底鼓 + 康加鼓 + 3-2 克拉维 + 沙锤 + 卡林巴琴 + 反拍低音 + “ooh”人声和声），A 小调 → C 大调 | ~1:50 |
| `Perfect` | **背光观察室 · 观察 No.13《完美主义》**（伏尔泰“完美是好的敌人”）——**白板手绘版** | 白板 + 马克笔手绘（roughjs），一只握笔的手跟着笔尖画，手写体（站酷快乐体），重点词红笔 + 黄色荧光笔 + 波浪下划线；核心意象：白纸上反复画下又擦掉的第一笔，旁边一墙越画越好的画，最后落下一笔歪歪扭扭的线 | 120 BPM “stompclap”配乐（木吉他扫弦 + 跺脚拍手 + 响指 + 钟琴 + 低音提琴），G 大调 | ~1:46 |
| `Friction` | **背光观察室 · 观察 No.12《内耗》**（王阳明“人须在事上磨，方立得住”） | 同频道风格 + 动效层；核心意象：人物坐着不动，头顶翻滚着黑色线团和想象中的念头；他站起来伸手做事，线团一根根被抽直、理顺 | 120 BPM “guochao”配乐（古筝拨弦 + 笛子 + 锣 + 半拍鼓，段落前古筝刮奏），D 羽调式 | ~1:54 |
| `Age` | **背光观察室 · 观察 No.11《年龄焦虑》**（海德格尔“向死而生”） | 同频道风格 + 动效层；核心意象：钉满别人里程碑的时间轴，人物在轴上奔跑；最后走下时间轴，脚下长出只属于他的小路 | 120 BPM “cinematic”配乐（断弓弦乐 + 太鼓 + 铜管轰鸣 + 谢泼德音 + 钢琴），升 C 小调 | ~1:50 |
| `Nostalgia` | **背光观察室 · 观察 No.10《怀旧》**（克尔凯郭尔“人生只能向后理解，却必须向前生活”） | 同频道风格；核心意象：人物倒着走路，身后是一条暖黄色、清晰的来路（路边立着老照片），身前是一片灰雾；最后他转过身，灰雾里慢慢亮起暖色 | 120 BPM “cassette”配乐（八音盒旋律 + 门限混响军鼓 + 奔马低音 + 通鼓过门 + 磁带停转），A 大调 | ~1:48 |
| `Revenge` | **背光观察室 · 观察 No.09《报复性熬夜》**（马克思《1844年经济学哲学手稿》） | 同频道风格；核心意象：白天人物被“工作、消息、会议……”的细线牵着像提线木偶；深夜细线一根根断开，他坐在手机屏幕的光里；最后阳光下他自己剪断了一根线 | 120 BPM “lofi”配乐（黑胶底噪 + 电钢琴 + 摇摆鼓 + 808 + trap 镲片），F♯ 小调 | ~1:48 |
| `Procrastination` | **背光观察室 · 观察 No.08《拖延》**（塞涅卡《论生命之短暂》） | 同频道风格；核心意象：日历一页页被撕下，每页都写着“明天”，人物站在一堆“明天”中间；最后他撕下一页，下面写着“今天” | 120 BPM “clockwork”配乐（钟表滴答 + 拨弦 + 半拍鼓 + 钟琴），B 小调 | ~1:50 |
| `Humility` | **背光观察室 · 观察 No.07《谦虚》**（拉罗什福科“谦虚是骄傲的计谋”） | 同频道风格；核心意象：人物戴着低头微笑的面具，面具背后的脸仰着头、墙上的影子昂着头；他把天平上属于自己的砝码拿开，面具随之脱落 | 120 BPM “drive”，G 小调 | ~1:44 |
| `Solitude` | **背光观察室 · 观察 No.06《孤独》**（叔本华“豪猪困境”） | 同频道风格；核心意象：雪地里的豪猪靠近、刺痛、分开；热闹人群里所有人轮廓清晰，只有主角是半透明的虚线；结尾他一个人坐在窗边，轮廓重新变清晰 | 120 BPM “drive”，F 小调 | ~1:50 |
| `Regret` | **背光观察室 · 观察 No.05《后悔》**（斯宾诺莎“后悔的人是双重的不幸”） | 同频道风格；核心意象：深夜的卧室，放映机把同一个片段循环投到墙上，片段越播越多、层层叠叠，最后放映机关掉、窗外天亮 | 120 BPM “drive”，C 小调 | ~1:54 |
| `Anxiety` | **背光观察室 · 观察 No.04《焦虑》**（克尔凯郭尔“焦虑是自由的眩晕”） | 同频道风格；核心意象：悬崖下无数条发光的岔路，俯拍、旋转、红蓝重影制造眩晕，最后踏上其中一条、其余熄灭 | 120 BPM “drive”，D 小调 | ~1:46 |
| `Inferiority` | **背光观察室 · 观察 No.03《自卑》**（阿德勒“优越感是对自卑的补偿”） | 同频道风格；核心意象：人物身上贴满金色标签，标签下透出被背光照亮的裂纹，结尾标签剥落、裂纹愈合 | 120 BPM “drive”，E 小调 | ~1:48 |
| `Pleasing` | **背光观察室 · 观察 No.02《讨好》**（萨特“他人即地狱”） | 冷蓝黑底、青色强调、光从人物**背后**打来；取景框、REC、时间码 | 120 BPM，“drive”配乐：鼓组 + 抽吸低音 + 琶音，段落间军鼓滚奏推进，A 小调 | ~1:48 |
| `Pride` | 《傲慢》——拆解参考视频结构的练习 | 暖黑底、顶光、石膏头像 | 72 BPM，“ambient”配乐 | ~1:58 |

## 运行

```bash
cd explainer-video
npm install
npm run studio          # 浏览器里预览所有期
npm run render          # 《INTJ · 正确》→ out/intj.mp4
npm run render:fomo     # 《信息焦虑》
npm run render:emptiness # 《空虚》
npm run render:burnout  # 《倦怠》
npm run render:control  # 《控制欲》
npm run render:love     # 《恋爱脑》
npm run render:glass    # 《玻璃心》
npm run render:social   # 《社恐》
npm run render:appearance # 《容貌焦虑》
npm run render:doubt    # 《自我怀疑》
npm run render:perfect  # 《完美主义》
npm run render:friction # 《内耗》
npm run render:age      # 《年龄焦虑》
npm run render:nostalgia # 《怀旧》
npm run render:revenge  # 《报复性熬夜》
npm run render:procrastination # 《拖延》
npm run render:humility # 《谦虚》→ out/humility.mp4
npm run render:solitude # 《孤独》→ out/solitude.mp4
npm run render:regret   # 《后悔》→ out/regret.mp4
npm run render:anxiety  # 《焦虑》→ out/anxiety.mp4
npm run render:inferiority # 《自卑》→ out/inferiority.mp4
npm run render:pleasing # 《讨好》→ out/pleasing.mp4
npm run render:pride    # 《傲慢》→ out/pride.mp4
```

渲染前会自动生成配乐和音效（`npm run music`）。Remotion 首次渲染会下载 headless Chrome，下载不了时加 `--browser-executable=/path/to/chrome`。

## 目录

```
src/
  channels/whiteboard/   白板手绘风格：BoardFrame（白板）、sketch.tsx（roughjs 手绘笔画逐笔画出 + 握笔的手 + 手写字 + 板擦）、BoardEndCard、BoardQuestion
  channels/backlit/      背光观察室频道共用：
    channel.ts           频道名、片尾签名「这里是背光观察室，我们观察那些不被看见的部分。」
    look.ts              配色和字体
    ObsFrame.tsx         画框：取景框四角、REC、时间码、频道标识、切镜闪光
    parts.tsx            视觉零件：背光人物、巨眼、取景框、镜子、视线
    figure.tsx           三种姿势的人物剪影（自然 / 昂头 / 低头）
    TypewriterScene.tsx  打字机式单句分镜（“可这样活着，有什么不好？”）
    EndCard.tsx          片尾卡：频道名 + 逐字打出的签名
  episodes/
    registry.ts          所有期的数据登记表（配乐、配音、字体预加载都从这里读）
    intj/                人格 No.01《INTJ · 正确》（blueprint.tsx：会自己画出来的蓝图、✓ 与 ？、留白和门，以及“确信”的玻璃箱）
    fomo/                观察 No.22《信息焦虑》（screens.tsx：一圈发光的小屏幕、会变淡的人、餐桌和对面说话的人）
    emptiness/           观察 No.21《空虚》（pendulum.tsx：巨大的钟摆和坐在摆锤上的人、“痛苦”“无聊”两端，以及结尾那张点着台灯的书桌）
    burnout/             观察 No.20《倦怠》（treadmill.tsx：跑步机——会加速的传送带、写着“你可以”的控制面板、STOP 键，和自己抽鞭子的跑者）
    control/             观察 No.19《控制欲》（ropes.tsx：攥着一把绳子的人，绳子会绷紧、发红、松开掉落）
    love/                观察 No.18《恋爱脑》（lovers.tsx：会倚靠/摇晃/变透明的人、成对的人、地上会分开的影子）
    glass/               观察 No.17《玻璃心》（immersive.tsx：手持镜头 Cam、Bokeh、SpeedLines、Shards；parts.tsx：会裂会愈合的玻璃心、文字箭、玻璃门、皇帝）
    social/              观察 No.16《社恐》（lights.tsx：吊着的舞台灯、光柱和地上的光斑、模糊人群、每人一盏灯的人群、日光）
    appearance/          观察 No.15《容貌焦虑》（faces.tsx：可磨皮/美白/瘦脸/大眼/变成石膏像、会哭会笑会老的正脸，手机（可“显像管式”熄屏）、椭圆镜子、美颜滑杆）
    doubt/               观察 No.14《自我怀疑》（circles.tsx：地上的光圈与圈外的问号、俯视的知识圆、能从低头慢慢抬起头的人）
    perfect/             观察 No.13《完美主义》白板版（drawings.tsx：白纸、第一笔、火柴人、越画越好的猫）
    friction/            观察 No.12《内耗》（tangle.tsx：会被抽直的线团、坐着/伸手的人）
    age/                 观察 No.11《年龄焦虑》（timeline.tsx：别人的里程碑时间轴、自己的小路）
    nostalgia/           观察 No.10《怀旧》（road.tsx：侧身走路的人、暖色来路与灰雾、老照片）
    revenge/             观察 No.09《报复性熬夜》（puppet.tsx：提线木偶、深夜卧室、剪刀、24 小时条）
    procrastination/     观察 No.08《拖延》（calendar.tsx：撕页日历、满地的“明天”）
    humility/            观察 No.07《谦虚》（mask.tsx：面具人物、墙上的影子、天平与砝码、对话气泡）
    solitude/            观察 No.06《孤独》（porcupine.tsx：雪地豪猪、人群与半透明的主角、窗边座位）
    regret/              观察 No.05《后悔》（projector.tsx：深夜卧室、放映机、循环播放的片段）
    anxiety/             观察 No.04《焦虑》（paths.tsx：发光岔路网、悬崖、眩晕镜头）
    inferiority/         观察 No.03《自卑》
      script.ts          文案（每个分镜一组字幕；最后一行是片尾签名）
      episode.ts         期号、BPM、每个分镜的音乐情绪
      gilded.tsx         这一期的核心意象：贴满金标签、带裂纹的人物，可剥落、可愈合
      scenes/*.tsx       分镜
    pleasing/            观察 No.02《讨好》
    pride/               《傲慢》（参考练习，不属于本频道）
  timeline.ts            节拍网格：每句字幕从拍点开始、每个分镜从小节线开始
  EpisodeVideo.tsx       通用播放器：按顺序播放分镜 + 配乐（+ 可选配音）
  components/            通用组件：字幕、音效、剪影、石膏头像、碎裂标题…
scripts/
  music.mjs              生成 public/music/<期>.wav 和 public/sfx/*.wav
  audio/score-drive.mjs  “drive”配乐（No.02–No.07）：鼓组 + 锯齿低音 + 方波琶音
  audio/score-industrial.mjs “industrial”配乐（《INTJ · 正确》）：失真底鼓 + 步进贝斯（十六分音符、重音、共振滤波）+ 门限军鼓 + FM 金属撞击 + 冷色双锯齿主音 + 闷音钢琴
  audio/score-glitchhop.mjs “glitchhop”配乐（《信息焦虑》）：摇摆碎拍 + 位压缩 + 三连音摇摆贝斯 + 通知音 + 卡顿切片 + 卡林巴琴；进安静段前整小节“死机”式碎掉
  audio/score-frenchhouse.mjs “frenchhouse”配乐（《空虚》）：四拍底鼓 + 侧链抽吸 + 滤波迪斯科和弦循环（高能处按十六分切片）+ 拨弦贝斯 + 弦乐爬升 + 八音盒和钟摆嘀嗒；进高潮前滤波先关死再猛开，进安静段前磁带急停
  audio/score-breakbeat.mjs “breakbeat”配乐（《倦怠》）：切片碎拍 + 鬼音军鼓 + reese 贝斯（双锯齿、滤波呼吸）+ 锯齿切音 + 警笛线 + 竖琴
  audio/score-acid.mjs “acid”配乐（《控制欲》）：隆隆底鼓 + 303 风格酸性贝斯（重音、滑音、共振滤波）+ 开镲 + 和弦切音 + 管钟
  audio/score-dembow.mjs “dembow”配乐（《恋爱脑》）：雷鬼动节奏 + 定音鼓过门 + 次低音 + 马林巴 + Karplus–Strong 尼龙吉他 + 合成拨弦
  audio/score-phonk.mjs “phonk”配乐（《玻璃心》）：音高 808 牛铃 riff + 失真滑音 808 + 重鼓 + 三连音踩镲 + “ha”人声切片 + 玻璃琴/玻璃风铃；落拍时有碎玻璃冲击
  audio/score-electroswing.mjs “electroswing”配乐（《社恐》）：四拍底鼓 + 摇摆镲/踩镲 + 刷子 + Karplus–Strong 行走低音 + 查尔斯顿钢琴 + 铜管齐奏 + 单簧管；段落前铜管滑音渐强，进入安静段前“ba-dum…tss”收尾
  audio/score-futurebass.mjs “futurebass”配乐（《容貌焦虑》）：超锯齿和弦（弯音进入、随底鼓“泵”）+ 半拍鼓 + 次低音 + 共振峰人声切片 + 方波拨弦 + 毛毡钢琴；段落前军鼓滚奏加速 + 噪声上升 + 半拍静音再落拍，进入安静段前和弦“故障”式断开
  audio/score-afrohouse.mjs “afrohouse”配乐（《自我怀疑》）：深沉四拍底鼓 + 康加/通巴鼓 + 3-2 克拉维 + 沙锤 + 卡林巴琴固定音型 + 反拍低音 + 共振峰“ooh”人声
  audio/score-stompclap.mjs “stompclap”配乐（《完美主义》）：Karplus–Strong 木吉他扫弦 + 跺脚 + 拍手 + 响指 + 钟琴 + 拨弦低音
  audio/score-guochao.mjs “guochao”配乐（《内耗》）：Karplus–Strong 古筝 + 笛子 + 锣 + 框鼓 + 半拍鼓，古筝刮奏过门
  audio/score-cinematic.mjs “cinematic”配乐（《年龄焦虑》）：断弓弦乐 + 太鼓 + 铜管 + 谢泼德音 + 钢琴
  audio/score-cassette.mjs “cassette”配乐（《怀旧》）：八音盒 + 80 年代门限混响军鼓 + 奔马节奏低音 + 合成器和弦 + 磁带抖动/停转
  audio/score-lofi.mjs  “lofi”配乐（《报复性熬夜》）：黑胶底噪 + FM 电钢琴 + 摇摆 boom-bap + 808 滑音 + trap 镲片滚奏
  audio/score-clockwork.mjs “clockwork”配乐（《拖延》）：滴答木鱼 + 拨弦固定音型 + 钢琴低音 + 半拍鼓 + 钟琴
  audio/score-ambient.mjs“ambient”配乐（《傲慢》）
  audio/sfx.mjs          音效：boom / shatter / rise / whoosh / glint / step / shutter / glitch / stamp
  voiceover.mjs          可选配音
```

## 改文案 / 做新一期

1. **文案**：改 `src/episodes/<期>/script.ts`。`【】` 里的字高亮；`【【】】` 是一句里最能引发共鸣的词，开了动效层（`look: backlitLookFx`）后它会最后入场、放大、金色、带光扫和下划线；`\n` 换行。每句的停留时间按阅读速度自动算（每秒 7 字 + 0.8 秒），取整到整拍；某句需要多停一会儿，加 `seconds`。
2. **节拍**：`episode.ts` 里的 `bpm` 必须让一拍是整数帧（30fps 下 72 / 90 / 100 / 120 都可以）。分镜里用 `BEAT`、`HALF_BEAT`、`onBeat()` 把动作和音效对在拍上，`<Sfx>` 会自动对齐到最近的半拍。
3. **音乐**：每期用一组新的配乐（不同的鼓型、低音、旋律乐器），在 `scripts/audio/` 加一个 `score-<名字>.mjs`，在 `scripts/music.mjs` 的 `SCORES` 和 `src/types.ts` 的 `music` 里登记，`episode.ts` 里写 `music: "<名字>"`。`moods` 给每个分镜写和弦进行（每小节一个和弦，循环）和能量：
   - `0` 只有铺底（留白、结尾）
   - `1` 加低音脉冲和踩镲
   - `2` 加底鼓、军鼓/拍手、16 分踩镲，进段落时有镲片
   - `3` 再加琶音和开镲（高潮）

   能量升到 2 以上之前的一小节自动做军鼓滚奏 + 上升音；进能量 0 之前自动“急停”。
4. **新一期**：复制 `episodes/doubt`（背光动效版）或 `episodes/perfect`（白板版），改文案、分镜、`episode.ts`（期号、和弦、能量），在 `src/episodes/registry.ts` 和 `src/Root.tsx` 各登记一行。文案最后一行保留 `channel.signoff`，片尾签名就会自动出现。

## 可选：配音

默认没有配音（字幕 + 音乐）。需要时：

```bash
pip install edge-tts
npm run voiceover -- --episode=pleasing --engine=edge      # 在线，Edge TTS
# 或离线 Kokoro：pip install sherpa-onnx soundfile，下载 kokoro-multi-lang-v1_1 后
KOKORO_DIR=/path/to/kokoro-multi-lang-v1_1 npm run voiceover -- --episode=pleasing
```

有配音时每句时长会让位给配音长度，背景音乐在旁白处自动压低。想换回无配音，清空 `src/voiceover.generated.ts`。

## 版权说明

- 代码、画面、配乐、音效都是本项目原创生成的。
- 《傲慢》的文案来自参考视频的字幕，只作为结构练习；公开发布请用自己的文案（如《讨好》）。

字体：Noto Serif SC / Noto Sans SC / JetBrains Mono（均为 SIL OFL），通过 `@fontsource` 本地打包。
