import json, re, unicodedata
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
ZH=ROOT/'public/data/languages/zh.json'
DB=Path('/usr/share/texlive/texmf-dist/tex/latex/xpinyin/xpinyin-database.def')

# Carefully selected high-utility Mandarin vocabulary expansion.
# Format: word | meaning | part of speech | category | difficulty
raw = r'''
我|I;me|Pronoun|People & Pronouns|beginner
你|you|Pronoun|People & Pronouns|beginner
您|you (polite)|Pronoun|People & Pronouns|beginner
他|he;him|Pronoun|People & Pronouns|beginner
她|she;her|Pronoun|People & Pronouns|beginner
它|it|Pronoun|People & Pronouns|beginner
我们|we;us|Pronoun|People & Pronouns|beginner
你们|you (plural)|Pronoun|People & Pronouns|beginner
他们|they;them|Pronoun|People & Pronouns|beginner
她们|they (female)|Pronoun|People & Pronouns|beginner
自己|self;oneself|Pronoun|People & Pronouns|beginner
别人|other people|Pronoun|People & Pronouns|beginner
大家|everyone|Pronoun|People & Pronouns|beginner
谁|who|Pronoun|Question Words|beginner
什么|what|Pronoun|Question Words|beginner
哪里|where|Pronoun|Question Words|beginner
哪儿|where|Pronoun|Question Words|beginner
哪个|which|Pronoun|Question Words|beginner
怎么|how|Pronoun|Question Words|beginner
为什么|why|Pronoun|Question Words|beginner
多少|how many;how much|Pronoun|Question Words|beginner
几|how many;several|Pronoun|Question Words|beginner
怎么样|how;how about|Pronoun|Question Words|beginner
这|this|Pronoun|Demonstratives|beginner
那|that|Pronoun|Demonstratives|beginner
这里|here|Pronoun|Demonstratives|beginner
那里|there|Pronoun|Demonstratives|beginner
这些|these|Pronoun|Demonstratives|beginner
那些|those|Pronoun|Demonstratives|beginner
这个|this one|Pronoun|Demonstratives|beginner
那个|that one|Pronoun|Demonstratives|beginner
的|possessive/attributive particle|Particle|Grammar & Particles|beginner
了|completed-action/change-of-state particle|Particle|Grammar & Particles|beginner
吗|yes-no question particle|Particle|Grammar & Particles|beginner
呢|question/topic particle|Particle|Grammar & Particles|beginner
吧|suggestion/softening particle|Particle|Grammar & Particles|beginner
啊|exclamation particle|Particle|Grammar & Particles|beginner
着|ongoing-state particle|Particle|Grammar & Particles|elementary
过|experiential particle|Particle|Grammar & Particles|elementary
得|complement particle|Particle|Grammar & Particles|elementary
地|adverbial particle|Particle|Grammar & Particles|elementary
不|not;no|Adverb|Grammar & Particles|beginner
没|not;have not|Adverb|Grammar & Particles|beginner
没有|not have;there is not|Verb|Grammar & Particles|beginner
别|don't|Adverb|Grammar & Particles|beginner
也|also;too|Adverb|Grammar & Particles|beginner
都|all;both|Adverb|Grammar & Particles|beginner
很|very|Adverb|Grammar & Particles|beginner
太|too;extremely|Adverb|Grammar & Particles|beginner
最|most|Adverb|Grammar & Particles|beginner
更|more;even more|Adverb|Grammar & Particles|elementary
还|still;also|Adverb|Grammar & Particles|beginner
又|again;also|Adverb|Grammar & Particles|elementary
再|again;then|Adverb|Grammar & Particles|beginner
已经|already|Adverb|Grammar & Particles|beginner
正在|be in the process of|Adverb|Grammar & Particles|elementary
马上|immediately|Adverb|Time & Frequency|beginner
一起|together|Adverb|Everyday Expressions|beginner
一定|certainly;definitely|Adverb|Everyday Expressions|elementary
当然|of course|Adverb|Everyday Expressions|beginner
可能|maybe;possible|Adverb|Everyday Expressions|elementary
真的|really;truly|Adverb|Everyday Expressions|beginner
其实|actually|Adverb|Everyday Expressions|elementary
特别|especially;special|Adverb|Everyday Expressions|elementary
非常|very;extremely|Adverb|Everyday Expressions|beginner
比较|relatively;compare|Adverb|Everyday Expressions|elementary
大概|approximately;probably|Adverb|Everyday Expressions|elementary

零|zero|Number|Numbers|beginner
一|one|Number|Numbers|beginner
二|two|Number|Numbers|beginner
三|three|Number|Numbers|beginner
四|four|Number|Numbers|beginner
五|five|Number|Numbers|beginner
六|six|Number|Numbers|beginner
七|seven|Number|Numbers|beginner
八|eight|Number|Numbers|beginner
九|nine|Number|Numbers|beginner
十|ten|Number|Numbers|beginner
百|hundred|Number|Numbers|beginner
千|thousand|Number|Numbers|beginner
万|ten thousand|Number|Numbers|elementary
第一|first|Number|Numbers|beginner
第二|second|Number|Numbers|beginner
两|two (before measure words)|Number|Numbers|beginner
半|half|Number|Numbers|beginner
一半|half|Number|Numbers|beginner
几乎|almost|Adverb|Numbers|elementary
一点|a little|Phrase|Numbers|beginner
一些|some;a few|Phrase|Numbers|beginner
很多|many;a lot|Phrase|Numbers|beginner
多少|how many;how much|Pronoun|Numbers|beginner
个|general measure word|Measure Word|Measure Words|beginner
本|measure word for books|Measure Word|Measure Words|beginner
张|measure word for flat objects|Measure Word|Measure Words|beginner
杯|cup;measure word for cups|Measure Word|Measure Words|beginner
瓶|bottle;measure word for bottles|Measure Word|Measure Words|beginner
件|measure word for clothes/things|Measure Word|Measure Words|beginner
辆|measure word for vehicles|Measure Word|Measure Words|beginner
台|measure word for machines|Measure Word|Measure Words|beginner
条|measure word for long things|Measure Word|Measure Words|beginner
只|measure word for animals/some objects|Measure Word|Measure Words|beginner
双|pair;measure word for pairs|Measure Word|Measure Words|beginner
位|measure word for people (polite)|Measure Word|Measure Words|elementary
次|time;occasion|Measure Word|Measure Words|beginner
遍|measure word for occurrences/actions|Measure Word|Measure Words|elementary

今天|today|Noun|Time & Dates|beginner
昨天|yesterday|Noun|Time & Dates|beginner
明天|tomorrow|Noun|Time & Dates|beginner
现在|now|Noun|Time & Dates|beginner
以前|before;previously|Noun|Time & Dates|beginner
以后|after;later|Noun|Time & Dates|beginner
刚才|just now|Noun|Time & Dates|beginner
时候|time;moment|Noun|Time & Dates|beginner
时间|time|Noun|Time & Dates|beginner
早上|morning|Noun|Time & Dates|beginner
上午|morning|Noun|Time & Dates|beginner
中午|noon|Noun|Time & Dates|beginner
下午|afternoon|Noun|Time & Dates|beginner
晚上|evening;night|Noun|Time & Dates|beginner
夜里|at night|Noun|Time & Dates|elementary
早晨|early morning|Noun|Time & Dates|beginner
每天|every day|Adverb|Time & Dates|beginner
每年|every year|Adverb|Time & Dates|beginner
每次|every time|Adverb|Time & Dates|beginner
周|week|Noun|Time & Dates|beginner
星期|week|Noun|Time & Dates|beginner
星期一|Monday|Noun|Time & Dates|beginner
星期二|Tuesday|Noun|Time & Dates|beginner
星期三|Wednesday|Noun|Time & Dates|beginner
星期四|Thursday|Noun|Time & Dates|beginner
星期五|Friday|Noun|Time & Dates|beginner
星期六|Saturday|Noun|Time & Dates|beginner
星期天|Sunday|Noun|Time & Dates|beginner
月份|month|Noun|Time & Dates|beginner
月|month;moon|Noun|Time & Dates|beginner
年|year|Noun|Time & Dates|beginner
日|day;date|Noun|Time & Dates|elementary
号|date number;number|Noun|Time & Dates|beginner
分钟|minute|Noun|Time & Dates|beginner
小时|hour|Noun|Time & Dates|beginner
秒|second|Noun|Time & Dates|elementary
点|o'clock;point|Noun|Time & Dates|beginner
以前|before|Noun|Time & Dates|beginner
后来|later;afterward|Noun|Time & Dates|elementary
最近|recently|Adverb|Time & Dates|elementary
将来|future|Noun|Time & Dates|elementary
过去|past|Noun|Time & Dates|elementary

家|home;family|Noun|Family & People|beginner
家庭|family;household|Noun|Family & People|beginner
爸爸|dad|Noun|Family & People|beginner
妈妈|mom|Noun|Family & People|beginner
父亲|father|Noun|Family & People|elementary
母亲|mother|Noun|Family & People|elementary
父母|parents|Noun|Family & People|beginner
儿子|son|Noun|Family & People|beginner
女儿|daughter|Noun|Family & People|beginner
孩子|child|Noun|Family & People|beginner
小孩|child|Noun|Family & People|beginner
哥哥|older brother|Noun|Family & People|beginner
姐姐|older sister|Noun|Family & People|beginner
弟弟|younger brother|Noun|Family & People|beginner
妹妹|younger sister|Noun|Family & People|beginner
爷爷|grandfather|Noun|Family & People|beginner
奶奶|grandmother|Noun|Family & People|beginner
叔叔|uncle;adult male|Noun|Family & People|beginner
阿姨|aunt;adult woman|Noun|Family & People|beginner
丈夫|husband|Noun|Family & People|elementary
妻子|wife|Noun|Family & People|elementary
老公|husband|Noun|Family & People|beginner
老婆|wife|Noun|Family & People|beginner
朋友|friend|Noun|Family & People|beginner
同学|classmate|Noun|Family & People|beginner
同事|colleague|Noun|Family & People|elementary
老师|teacher|Noun|Family & People|beginner
学生|student|Noun|Family & People|beginner
医生|doctor|Noun|Family & People|beginner
护士|nurse|Noun|Family & People|beginner
经理|manager|Noun|Family & People|elementary
老板|boss|Noun|Family & People|beginner
客人|guest;customer|Noun|Family & People|beginner
顾客|customer|Noun|Family & People|elementary
邻居|neighbor|Noun|Family & People|elementary
名字|name|Noun|Family & People|beginner
姓名|name|Noun|Family & People|elementary
人|person;people|Noun|Family & People|beginner
男人|man|Noun|Family & People|beginner
女人|woman|Noun|Family & People|beginner
男孩|boy|Noun|Family & People|beginner
女孩|girl|Noun|Family & People|beginner
年轻人|young person|Noun|Family & People|elementary
老人|elderly person|Noun|Family & People|beginner
先生|Mr.;sir|Noun|Family & People|beginner
小姐|Miss;young woman|Noun|Family & People|beginner
女士|Ms.;lady|Noun|Family & People|elementary

学校|school|Noun|School & Learning|beginner
大学|university|Noun|School & Learning|beginner
中学|middle school;secondary school|Noun|School & Learning|elementary
小学|primary school|Noun|School & Learning|beginner
教室|classroom|Noun|School & Learning|beginner
课|class;lesson|Noun|School & Learning|beginner
课程|course|Noun|School & Learning|elementary
作业|homework|Noun|School & Learning|beginner
考试|exam|Noun|School & Learning|beginner
问题|question;problem|Noun|School & Learning|beginner
答案|answer|Noun|School & Learning|beginner
书|book|Noun|School & Learning|beginner
书本|book|Noun|School & Learning|beginner
字|character;word|Noun|School & Learning|beginner
汉字|Chinese character|Noun|School & Learning|beginner
中文|Chinese language|Noun|School & Learning|beginner
英语|English language|Noun|School & Learning|beginner
语言|language|Noun|School & Learning|beginner
学习|study;learn|Verb|School & Learning|beginner
练习|practice;exercise|Verb|School & Learning|beginner
复习|review|Verb|School & Learning|elementary
记住|remember|Verb|School & Learning|beginner
忘记|forget|Verb|School & Learning|beginner
理解|understand|Verb|School & Learning|elementary
明白|understand;clear|Verb|School & Learning|beginner
解释|explain|Verb|School & Learning|elementary
意思|meaning|Noun|School & Learning|beginner
知识|knowledge|Noun|School & Learning|elementary
经验|experience|Noun|School & Learning|elementary
方法|method;way|Noun|School & Learning|elementary
练习册|workbook|Noun|School & Learning|elementary

公司|company|Noun|Work & Business|beginner
工作|work;job|Noun|Work & Business|beginner
工作|work;to work|Verb|Work & Business|beginner
办公室|office|Noun|Work & Business|beginner
会议|meeting|Noun|Work & Business|elementary
同事|colleague|Noun|Work & Business|elementary
经理|manager|Noun|Work & Business|elementary
员工|employee|Noun|Work & Business|elementary
老板|boss|Noun|Work & Business|beginner
客户|client;customer|Noun|Work & Business|elementary
公司|company|Noun|Work & Business|beginner
企业|enterprise|Noun|Work & Business|elementary
生意|business|Noun|Work & Business|elementary
市场|market|Noun|Work & Business|elementary
价格|price|Noun|Work & Business|beginner
钱|money|Noun|Shopping & Money|beginner
现金|cash|Noun|Shopping & Money|elementary
银行卡|bank card|Noun|Shopping & Money|elementary
信用卡|credit card|Noun|Shopping & Money|elementary
银行|bank|Noun|Shopping & Money|beginner
商店|shop;store|Noun|Shopping & Money|beginner
超市|supermarket|Noun|Shopping & Money|beginner
市场|market|Noun|Shopping & Money|beginner
购物|shopping|Noun|Shopping & Money|beginner
东西|thing;stuff|Noun|Shopping & Money|beginner
商品|goods;product|Noun|Shopping & Money|elementary
衣服|clothes|Noun|Shopping & Money|beginner
鞋|shoe|Noun|Shopping & Money|beginner
帽子|hat|Noun|Shopping & Money|beginner
裤子|pants|Noun|Shopping & Money|beginner
裙子|skirt|Noun|Shopping & Money|beginner
外套|coat;jacket|Noun|Shopping & Money|beginner
颜色|color|Noun|Shopping & Money|beginner
红色|red|Noun|Colors & Descriptions|beginner
黄色|yellow|Noun|Colors & Descriptions|beginner
蓝色|blue|Noun|Colors & Descriptions|beginner
绿色|green|Noun|Colors & Descriptions|beginner
黑色|black|Noun|Colors & Descriptions|beginner
白色|white|Noun|Colors & Descriptions|beginner
灰色|gray|Noun|Colors & Descriptions|elementary
棕色|brown|Noun|Colors & Descriptions|elementary
粉色|pink|Noun|Colors & Descriptions|elementary
紫色|purple|Noun|Colors & Descriptions|elementary

吃|eat|Verb|Food & Drink|beginner
喝|drink|Verb|Food & Drink|beginner
饭|meal;rice|Noun|Food & Drink|beginner
米饭|cooked rice|Noun|Food & Drink|beginner
面条|noodles|Noun|Food & Drink|beginner
面包|bread|Noun|Food & Drink|beginner
鸡蛋|egg|Noun|Food & Drink|beginner
鸡肉|chicken|Noun|Food & Drink|beginner
牛肉|beef|Noun|Food & Drink|beginner
猪肉|pork|Noun|Food & Drink|beginner
鱼|fish|Noun|Food & Drink|beginner
虾|shrimp|Noun|Food & Drink|beginner
菜|dish;vegetable|Noun|Food & Drink|beginner
蔬菜|vegetables|Noun|Food & Drink|beginner
水果|fruit|Noun|Food & Drink|beginner
苹果|apple|Noun|Food & Drink|beginner
香蕉|banana|Noun|Food & Drink|beginner
橙子|orange|Noun|Food & Drink|beginner
西瓜|watermelon|Noun|Food & Drink|beginner
葡萄|grape|Noun|Food & Drink|beginner
草莓|strawberry|Noun|Food & Drink|elementary
牛奶|milk|Noun|Food & Drink|beginner
水|water|Noun|Food & Drink|beginner
茶|tea|Noun|Food & Drink|beginner
咖啡|coffee|Noun|Food & Drink|beginner
果汁|fruit juice|Noun|Food & Drink|beginner
啤酒|beer|Noun|Food & Drink|elementary
酒|alcohol;wine|Noun|Food & Drink|elementary
早餐|breakfast|Noun|Food & Drink|beginner
午饭|lunch|Noun|Food & Drink|beginner
午餐|lunch|Noun|Food & Drink|beginner
晚饭|dinner|Noun|Food & Drink|beginner
晚餐|dinner|Noun|Food & Drink|elementary
餐厅|restaurant|Noun|Food & Drink|beginner
饭馆|restaurant|Noun|Food & Drink|beginner
菜单|menu|Noun|Food & Drink|beginner
味道|taste;flavor|Noun|Food & Drink|elementary
甜|sweet|Adjective|Food & Drink|beginner
酸|sour|Adjective|Food & Drink|beginner
苦|bitter|Adjective|Food & Drink|elementary
辣|spicy;hot|Adjective|Food & Drink|beginner
咸|salty|Adjective|Food & Drink|elementary
饿|hungry|Adjective|Food & Drink|beginner
渴|thirsty|Adjective|Food & Drink|beginner
饱|full|Adjective|Food & Drink|beginner
好吃|delicious|Adjective|Food & Drink|beginner
好喝|tasty to drink|Adjective|Food & Drink|beginner

房子|house|Noun|Home|beginner
家里|at home|Noun|Home|beginner
房间|room|Noun|Home|beginner
卧室|bedroom|Noun|Home|beginner
客厅|living room|Noun|Home|beginner
厨房|kitchen|Noun|Home|beginner
厕所|toilet;restroom|Noun|Home|beginner
卫生间|bathroom;restroom|Noun|Home|beginner
门|door|Noun|Home|beginner
窗户|window|Noun|Home|beginner
桌子|table|Noun|Home|beginner
椅子|chair|Noun|Home|beginner
床|bed|Noun|Home|beginner
沙发|sofa|Noun|Home|beginner
电视|television|Noun|Home|beginner
冰箱|refrigerator|Noun|Home|beginner
空调|air conditioner|Noun|Home|beginner
电脑|computer|Noun|Technology|beginner
手机|mobile phone|Noun|Technology|beginner
电话|telephone|Noun|Technology|beginner
网络|internet;network|Noun|Technology|beginner
网站|website|Noun|Technology|beginner
软件|software|Noun|Technology|elementary
程序|program;procedure|Noun|Technology|elementary
文件|file;document|Noun|Technology|beginner
照片|photo|Noun|Technology|beginner
图片|picture;image|Noun|Technology|beginner
视频|video|Noun|Technology|beginner
音乐|music|Noun|Entertainment|beginner
电影|movie|Noun|Entertainment|beginner
电视节目|TV program|Noun|Entertainment|elementary
新闻|news|Noun|Entertainment|beginner
故事|story|Noun|Entertainment|beginner
游戏|game|Noun|Entertainment|beginner
歌|song|Noun|Entertainment|beginner

天气|weather|Noun|Nature & Weather|beginner
太阳|sun|Noun|Nature & Weather|beginner
月亮|moon|Noun|Nature & Weather|beginner
星星|star|Noun|Nature & Weather|beginner
天空|sky|Noun|Nature & Weather|beginner
云|cloud|Noun|Nature & Weather|beginner
雨|rain|Noun|Nature & Weather|beginner
雪|snow|Noun|Nature & Weather|beginner
风|wind|Noun|Nature & Weather|beginner
晴|sunny|Adjective|Nature & Weather|beginner
阴|cloudy|Adjective|Nature & Weather|elementary
热|hot|Adjective|Nature & Weather|beginner
冷|cold|Adjective|Nature & Weather|beginner
暖和|warm|Adjective|Nature & Weather|beginner
凉快|cool|Adjective|Nature & Weather|beginner
春天|spring|Noun|Nature & Weather|beginner
夏天|summer|Noun|Nature & Weather|beginner
秋天|autumn|Noun|Nature & Weather|beginner
冬天|winter|Noun|Nature & Weather|beginner
树|tree|Noun|Nature & Weather|beginner
花|flower|Noun|Nature & Weather|beginner
草|grass|Noun|Nature & Weather|beginner
山|mountain|Noun|Nature & Weather|beginner
河|river|Noun|Nature & Weather|beginner
海|sea|Noun|Nature & Weather|beginner
湖|lake|Noun|Nature & Weather|elementary
动物|animal|Noun|Nature & Weather|beginner
狗|dog|Noun|Nature & Weather|beginner
猫|cat|Noun|Nature & Weather|beginner
鸟|bird|Noun|Nature & Weather|beginner
鱼|fish|Noun|Nature & Weather|beginner

身体|body|Noun|Health & Body|beginner
头|head|Noun|Health & Body|beginner
脸|face|Noun|Health & Body|beginner
眼睛|eye|Noun|Health & Body|beginner
耳朵|ear|Noun|Health & Body|beginner
鼻子|nose|Noun|Health & Body|beginner
嘴|mouth|Noun|Health & Body|beginner
牙齿|tooth;teeth|Noun|Health & Body|beginner
手|hand|Noun|Health & Body|beginner
手指|finger|Noun|Health & Body|beginner
胳膊|arm|Noun|Health & Body|beginner
腿|leg|Noun|Health & Body|beginner
脚|foot|Noun|Health & Body|beginner
肚子|belly;stomach|Noun|Health & Body|beginner
心|heart|Noun|Health & Body|elementary
头发|hair|Noun|Health & Body|beginner
脸色|complexion|Noun|Health & Body|elementary
健康|health;healthy|Noun|Health & Body|beginner
生病|get sick;be ill|Verb|Health & Body|beginner
病|illness|Noun|Health & Body|beginner
感冒|cold;common cold|Noun|Health & Body|beginner
发烧|have a fever|Verb|Health & Body|beginner
疼|hurt;ache|Verb|Health & Body|beginner
痛|pain;hurt|Noun|Health & Body|elementary
医院|hospital|Noun|Health & Body|beginner
药|medicine|Noun|Health & Body|beginner
休息|rest|Verb|Health & Body|beginner
睡觉|sleep|Verb|Health & Body|beginner
起床|get up|Verb|Health & Body|beginner

走|walk;leave|Verb|Movement & Travel|beginner
跑|run|Verb|Movement & Travel|beginner
来|come|Verb|Movement & Travel|beginner
去|go|Verb|Movement & Travel|beginner
回|return|Verb|Movement & Travel|beginner
进入|enter|Verb|Movement & Travel|elementary
出去|go out|Verb|Movement & Travel|beginner
进来|come in|Verb|Movement & Travel|beginner
出去|go out|Verb|Movement & Travel|beginner
上去|go up|Verb|Movement & Travel|elementary
下来|come down|Verb|Movement & Travel|elementary
过去|go over;pass|Verb|Movement & Travel|elementary
过来|come over|Verb|Movement & Travel|elementary
到达|arrive|Verb|Movement & Travel|beginner
离开|leave|Verb|Movement & Travel|beginner
旅行|travel|Verb|Movement & Travel|beginner
旅游|travel;tourism|Verb|Movement & Travel|beginner
出发|set off;depart|Verb|Movement & Travel|elementary
到|arrive;reach|Verb|Movement & Travel|beginner
坐|sit;take (transport)|Verb|Movement & Travel|beginner
站|stand;station|Verb|Movement & Travel|beginner
等|wait|Verb|Movement & Travel|beginner
停|stop;park|Verb|Movement & Travel|beginner
走路|walk|Verb|Movement & Travel|beginner
跑步|run;jog|Verb|Movement & Travel|beginner
骑|ride|Verb|Movement & Travel|beginner
开|open;drive|Verb|Movement & Travel|beginner
关|close;turn off|Verb|Movement & Travel|beginner
机场|airport|Noun|Movement & Travel|beginner
火车站|train station|Noun|Movement & Travel|beginner
地铁|subway|Noun|Movement & Travel|beginner
公交车|bus|Noun|Movement & Travel|beginner
出租车|taxi|Noun|Movement & Travel|beginner
汽车|car|Noun|Movement & Travel|beginner
火车|train|Noun|Movement & Travel|beginner
飞机|airplane|Noun|Movement & Travel|beginner
自行车|bicycle|Noun|Movement & Travel|beginner
车站|station|Noun|Movement & Travel|beginner
路|road;way|Noun|Movement & Travel|beginner
街|street|Noun|Movement & Travel|beginner
地图|map|Noun|Movement & Travel|beginner
票|ticket|Noun|Movement & Travel|beginner
护照|passport|Noun|Movement & Travel|beginner
酒店|hotel|Noun|Movement & Travel|beginner
宾馆|hotel|Noun|Movement & Travel|elementary
地址|address|Noun|Movement & Travel|elementary
地方|place|Noun|Movement & Travel|beginner
城市|city|Noun|Movement & Travel|beginner
国家|country|Noun|Movement & Travel|beginner

做|do;make|Verb|Core Verbs|beginner
有|have;there is|Verb|Core Verbs|beginner
是|be|Verb|Core Verbs|beginner
在|be at;be located|Verb|Core Verbs|beginner
想|want;think|Verb|Core Verbs|beginner
要|want;need;will|Verb|Core Verbs|beginner
能|can;be able to|Verb|Core Verbs|beginner
可以|can;may|Verb|Core Verbs|beginner
会|can;know how to|Verb|Core Verbs|beginner
应该|should|Verb|Core Verbs|elementary
必须|must|Verb|Core Verbs|elementary
需要|need|Verb|Core Verbs|beginner
喜欢|like|Verb|Core Verbs|beginner
爱|love|Verb|Core Verbs|beginner
知道|know|Verb|Core Verbs|beginner
认识|know;be acquainted with|Verb|Core Verbs|beginner
觉得|feel;think|Verb|Core Verbs|beginner
认为|believe;think|Verb|Core Verbs|elementary
希望|hope;wish|Verb|Core Verbs|beginner
相信|believe|Verb|Core Verbs|elementary
知道|know|Verb|Core Verbs|beginner
明白|understand|Verb|Core Verbs|beginner
记得|remember|Verb|Core Verbs|beginner
忘记|forget|Verb|Core Verbs|beginner
需要|need|Verb|Core Verbs|beginner
帮助|help|Verb|Core Verbs|beginner
需要|need|Verb|Core Verbs|beginner
给|give|Verb|Core Verbs|beginner
拿|take;hold|get|Verb|Core Verbs|beginner
放|put;place|Verb|Core Verbs|beginner
带|bring;carry|Verb|Core Verbs|beginner
送|give as a gift;deliver|Verb|Core Verbs|beginner
买|buy|Verb|Core Verbs|beginner
卖|sell|Verb|Core Verbs|beginner
找|look for;find|Verb|Core Verbs|beginner
等|wait|Verb|Core Verbs|beginner
问|ask|Verb|Core Verbs|beginner
回答|answer|Verb|Core Verbs|beginner
说|say;speak|Verb|Core Verbs|beginner
讲|speak;tell|Verb|Core Verbs|beginner
听|listen;hear|Verb|Core Verbs|beginner
看|look;watch;read|Verb|Core Verbs|beginner
读|read|Verb|Core Verbs|beginner
写|write|Verb|Core Verbs|beginner
学|study;learn|Verb|Core Verbs|beginner
教|teach|Verb|Core Verbs|beginner
用|use|Verb|Core Verbs|beginner
打开|open|Verb|Core Verbs|beginner
关闭|close;turn off|Verb|Core Verbs|elementary
开始|begin;start|Verb|Core Verbs|beginner
结束|end;finish|Verb|Core Verbs|beginner
完成|complete;finish|Verb|Core Verbs|elementary
准备|prepare|Verb|Core Verbs|beginner
决定|decide|Verb|Core Verbs|elementary
选择|choose|Verb|Core Verbs|elementary
改变|change|Verb|Core Verbs|elementary
发现|discover;find|Verb|Core Verbs|elementary
找到|find|Verb|Core Verbs|beginner
得到|get;obtain|Verb|Core Verbs|elementary
失去|lose|Verb|Core Verbs|elementary
成为|become|Verb|Core Verbs|elementary
变成|become;turn into|Verb|Core Verbs|elementary
保持|keep;maintain|Verb|Core Verbs|elementary
继续|continue|Verb|Core Verbs|elementary
停止|stop|Verb|Core Verbs|elementary
离开|leave|Verb|Core Verbs|beginner
回来|come back|Verb|Core Verbs|beginner
回去|go back|Verb|Core Verbs|beginner
发生|happen|Verb|Core Verbs|elementary
出现|appear|Verb|Core Verbs|elementary
存在|exist|Verb|Core Verbs|elementary
包括|include|Verb|Core Verbs|elementary
使用|use|Verb|Core Verbs|elementary
参加|participate;attend|Verb|Core Verbs|elementary
帮助|help|Verb|Core Verbs|beginner
保护|protect|Verb|Core Verbs|elementary
检查|check;inspect|Verb|Core Verbs|elementary
解决|solve|Verb|Core Verbs|elementary
说明|explain;illustrate|Verb|Core Verbs|elementary
介绍|introduce|Verb|Core Verbs|beginner
练习|practice|Verb|Core Verbs|beginner
复习|review|Verb|Core Verbs|elementary

好|good|Adjective|Descriptions|beginner
坏|bad|Adjective|Descriptions|beginner
大|big;large|Adjective|Descriptions|beginner
小|small|Adjective|Descriptions|beginner
多|many;much|Adjective|Descriptions|beginner
少|few;little|Adjective|Descriptions|beginner
高|high;tall|Adjective|Descriptions|beginner
低|low|Adjective|Descriptions|elementary
长|long|Adjective|Descriptions|beginner
短|short|Adjective|Descriptions|beginner
快|fast|Adjective|Descriptions|beginner
慢|slow|Adjective|Descriptions|beginner
早|early|Adjective|Descriptions|beginner
晚|late|Adjective|Descriptions|beginner
新|new|Adjective|Descriptions|beginner
旧|old;used|Adjective|Descriptions|beginner
年轻|young|Adjective|Descriptions|beginner
老|old|Adjective|Descriptions|beginner
漂亮|beautiful|Adjective|Descriptions|beginner
美丽|beautiful|Adjective|Descriptions|elementary
可爱|cute;lovely|Adjective|Descriptions|beginner
聪明|smart|Adjective|Descriptions|beginner
笨|stupid;clumsy|Adjective|Descriptions|elementary
容易|easy|Adjective|Descriptions|beginner
难|difficult|Adjective|Descriptions|beginner
简单|simple|Adjective|Descriptions|beginner
复杂|complex|Adjective|Descriptions|elementary
重要|important|Adjective|Descriptions|beginner
特别|special|Adjective|Descriptions|beginner
普通|ordinary|Adjective|Descriptions|elementary
一样|same|Adjective|Descriptions|beginner
不同|different|Adjective|Descriptions|beginner
正确|correct|Adjective|Descriptions|elementary
错误|wrong;error|Adjective|Descriptions|elementary
方便|convenient|Adjective|Descriptions|beginner
安全|safe|Adjective|Descriptions|beginner
危险|dangerous|Adjective|Descriptions|beginner
安静|quiet|Adjective|Descriptions|beginner
热闹|lively|Adjective|Descriptions|elementary
干净|clean|Adjective|Descriptions|beginner
脏|dirty|Adjective|Descriptions|beginner
忙|busy|Adjective|Descriptions|beginner
累|tired|Adjective|Descriptions|beginner
高兴|happy|Adjective|Emotions|beginner
开心|happy;glad|Adjective|Emotions|beginner
快乐|happy|Adjective|Emotions|beginner
难过|sad|Adjective|Emotions|beginner
伤心|sad;heartbroken|Adjective|Emotions|beginner
生气|angry|Adjective|Emotions|beginner
害怕|afraid|Adjective|Emotions|beginner
担心|worry|Verb|Emotions|beginner
紧张|nervous|Adjective|Emotions|elementary
放心|feel relieved|Verb|Emotions|elementary
喜欢|like|Verb|Emotions|beginner
讨厌|hate|Verb|Emotions|elementary
觉得|feel;think|Verb|Emotions|beginner
希望|hope|Verb|Emotions|beginner
相信|believe|Verb|Emotions|elementary

因为|because|Conjunction|Connectors|beginner
所以|so;therefore|Conjunction|Connectors|beginner
但是|but;however|Conjunction|Connectors|beginner
可是|but;however|Conjunction|Connectors|beginner
如果|if|Conjunction|Connectors|elementary
虽然|although|Conjunction|Connectors|elementary
然后|then;after that|Conjunction|Connectors|beginner
而且|and;moreover|Conjunction|Connectors|elementary
或者|or|Conjunction|Connectors|beginner
还是|or;still|Conjunction|Connectors|beginner
因为|because|Conjunction|Connectors|beginner
所以|therefore|Conjunction|Connectors|beginner
可是|but|Conjunction|Connectors|beginner
除了|except;besides|Preposition|Connectors|elementary
关于|about;regarding|Preposition|Connectors|elementary
对于|regarding;as for|Preposition|Connectors|elementary
根据|according to|Preposition|Connectors|elementary
通过|through;via|Preposition|Connectors|elementary
为了|in order to;for|Preposition|Connectors|elementary
向|toward|Preposition|Connectors|elementary
从|from|Preposition|Connectors|beginner
到|to;until|Preposition|Connectors|beginner
在|at;in|Preposition|Connectors|beginner
跟|with;follow|Preposition|Connectors|beginner
和|and;with|Conjunction|Connectors|beginner
对|toward;correct|Preposition|Connectors|beginner

书店|bookstore|Noun|Places|beginner
图书馆|library|Noun|Places|beginner
学校|school|Noun|Places|beginner
医院|hospital|Noun|Places|beginner
银行|bank|Noun|Places|beginner
邮局|post office|Noun|Places|elementary
警察局|police station|Noun|Places|elementary
商场|shopping mall|Noun|Places|beginner
超市|supermarket|Noun|Places|beginner
餐馆|restaurant|Noun|Places|beginner
公园|park|Noun|Places|beginner
动物园|zoo|Noun|Places|beginner
博物馆|museum|Noun|Places|elementary
电影院|cinema|Noun|Places|beginner
机场|airport|Noun|Places|beginner
车站|station|Noun|Places|beginner
厕所|restroom|Noun|Places|beginner
洗手间|restroom|Noun|Places|beginner
门口|entrance;doorway|Noun|Places|beginner
里面|inside|Noun|Places|beginner
外面|outside|Noun|Places|beginner
上面|above;on top|Noun|Places|beginner
下面|below|Noun|Places|beginner
前面|in front|Noun|Places|beginner
后面|behind|Noun|Places|beginner
旁边|beside|Noun|Places|beginner
附近|nearby|Noun|Places|beginner
中间|middle|Noun|Places|beginner
左边|left side|Noun|Places|beginner
右边|right side|Noun|Places|beginner

衣服|clothes|Noun|Shopping & Money|beginner
裤子|pants|Noun|Shopping & Money|beginner
裙子|skirt|Noun|Shopping & Money|beginner
衬衫|shirt|Noun|Shopping & Money|beginner
毛衣|sweater|Noun|Shopping & Money|beginner
袜子|socks|Noun|Shopping & Money|beginner
鞋子|shoes|Noun|Shopping & Money|beginner
眼镜|glasses|Noun|Shopping & Money|beginner
包|bag|Noun|Shopping & Money|beginner
钱包|wallet|Noun|Shopping & Money|beginner
礼物|gift|Noun|Shopping & Money|beginner
东西|thing;stuff|Noun|Shopping & Money|beginner
产品|product|Noun|Shopping & Money|elementary
质量|quality|Noun|Shopping & Money|elementary
便宜|cheap|Adjective|Shopping & Money|beginner
贵|expensive|Adjective|Shopping & Money|beginner
免费|free of charge|Adjective|Shopping & Money|beginner
折扣|discount|Noun|Shopping & Money|elementary
付款|pay;payment|Verb|Shopping & Money|elementary
支付|pay;payment|Verb|Shopping & Money|elementary
买单|pay the bill|Verb|Shopping & Money|beginner
价格|price|Noun|Shopping & Money|beginner
零钱|small change|Noun|Shopping & Money|elementary
美元|US dollar|Noun|Shopping & Money|elementary
人民币|Chinese yuan|Noun|Shopping & Money|elementary

房租|rent|Noun|Home|elementary
家具|furniture|Noun|Home|elementary
厨房|kitchen|Noun|Home|beginner
浴室|bathroom|Noun|Home|beginner
阳台|balcony|Noun|Home|elementary
楼|building;floor|Noun|Home|beginner
电梯|elevator|Noun|Home|beginner
楼梯|stairs|Noun|Home|beginner
钥匙|key|Noun|Home|beginner
灯|lamp;light|Noun|Home|beginner
灯光|lighting|Noun|Home|elementary
电|electricity|Noun|Home|beginner
水电|utilities;water and electricity|Noun|Home|elementary
垃圾|garbage|Noun|Home|beginner
洗衣机|washing machine|Noun|Home|elementary
空调|air conditioner|Noun|Home|beginner
冰箱|refrigerator|Noun|Home|beginner
微波炉|microwave|Noun|Home|elementary

手机|mobile phone|Noun|Technology|beginner
电脑|computer|Noun|Technology|beginner
平板电脑|tablet computer|Noun|Technology|elementary
耳机|earphones|Noun|Technology|beginner
充电器|charger|Noun|Technology|beginner
电池|battery|Noun|Technology|beginner
密码|password|Noun|Technology|beginner
账号|account|Noun|Technology|elementary
信息|information;message|Noun|Technology|beginner
消息|news;message|Noun|Technology|beginner
邮件|email;mail|Noun|Technology|beginner
电子邮件|email|Noun|Technology|elementary
号码|number|Noun|Technology|beginner
电话号码|telephone number|Noun|Technology|beginner
照片|photo|Noun|Technology|beginner
拍照|take a photo|Verb|Technology|beginner
下载|download|Verb|Technology|beginner
上传|upload|Verb|Technology|elementary
发送|send|Verb|Technology|beginner
接收|receive|Verb|Technology|elementary
保存|save|Verb|Technology|beginner
删除|delete|Verb|Technology|elementary
打开|open|Verb|Technology|beginner
关闭|close;turn off|Verb|Technology|beginner
搜索|search|Verb|Technology|beginner
点击|click|Verb|Technology|beginner
登录|log in|Verb|Technology|elementary
退出|log out|Verb|Technology|elementary
更新|update|Verb|Technology|elementary
安装|install|Verb|Technology|elementary

运动|exercise;sport|Noun|Hobbies & Sports|beginner
足球|football;soccer|Noun|Hobbies & Sports|beginner
篮球|basketball|Noun|Hobbies & Sports|beginner
网球|tennis|Noun|Hobbies & Sports|beginner
游泳|swimming|Noun|Hobbies & Sports|beginner
跑步|running|Noun|Hobbies & Sports|beginner
散步|take a walk|Verb|Hobbies & Sports|beginner
爬山|hike;climb mountains|Verb|Hobbies & Sports|beginner
跳舞|dance|Verb|Hobbies & Sports|beginner
唱歌|sing|Verb|Hobbies & Sports|beginner
画画|draw|Verb|Hobbies & Sports|beginner
拍照|take photos|Verb|Hobbies & Sports|beginner
旅行|travel|Verb|Hobbies & Sports|beginner
游泳池|swimming pool|Noun|Hobbies & Sports|beginner
比赛|competition;match|Noun|Hobbies & Sports|beginner
球队|sports team|Noun|Hobbies & Sports|elementary
运动员|athlete|Noun|Hobbies & Sports|elementary

早餐|breakfast|Noun|Daily Life|beginner
午餐|lunch|Noun|Daily Life|beginner
晚餐|dinner|Noun|Daily Life|beginner
起床|get up|Verb|Daily Life|beginner
洗澡|take a shower|Verb|Daily Life|beginner
洗脸|wash one's face|Verb|Daily Life|beginner
刷牙|brush teeth|Verb|Daily Life|beginner
穿|wear;put on|Verb|Daily Life|beginner
脱|take off|Verb|Daily Life|beginner
睡|sleep|Verb|Daily Life|beginner
睡觉|sleep|Verb|Daily Life|beginner
醒|wake up|Verb|Daily Life|beginner
休息|rest|Verb|Daily Life|beginner
做饭|cook|Verb|Daily Life|beginner
做菜|cook a dish|Verb|Daily Life|beginner
打扫|clean|Verb|Daily Life|beginner
洗|wash|Verb|Daily Life|beginner
洗衣服|wash clothes|Verb|Daily Life|beginner
开门|open the door|Verb|Daily Life|beginner
关门|close the door|Verb|Daily Life|beginner
出门|go out|Verb|Daily Life|beginner
回家|go home|Verb|Daily Life|beginner

爱好|hobby|Noun|Hobbies & Interests|beginner
兴趣|interest|Noun|Hobbies & Interests|elementary
音乐|music|Noun|Hobbies & Interests|beginner
电影|movie|Noun|Hobbies & Interests|beginner
小说|novel|Noun|Hobbies & Interests|elementary
书|book|Noun|Hobbies & Interests|beginner
故事|story|Noun|Hobbies & Interests|beginner
照片|photo|Noun|Hobbies & Interests|beginner
艺术|art|Noun|Hobbies & Interests|elementary
画|painting;picture|Noun|Hobbies & Interests|beginner
节目|program;show|Noun|Hobbies & Interests|beginner
新闻|news|Noun|Hobbies & Interests|beginner
明星|celebrity;star|Noun|Hobbies & Interests|elementary
演员|actor|Noun|Hobbies & Interests|beginner
歌手|singer|Noun|Hobbies & Interests|beginner

需要|need|Verb|Useful Abstract Words|beginner
机会|opportunity|Noun|Useful Abstract Words|elementary
办法|way;method|Noun|Useful Abstract Words|beginner
原因|reason|Noun|Useful Abstract Words|elementary
结果|result|Noun|Useful Abstract Words|elementary
事情|matter;thing|Noun|Useful Abstract Words|beginner
情况|situation|Noun|Useful Abstract Words|elementary
意思|meaning|Noun|Useful Abstract Words|beginner
地方|place|Noun|Useful Abstract Words|beginner
方面|aspect|Noun|Useful Abstract Words|elementary
方面|aspect|Noun|Useful Abstract Words|elementary
问题|problem;question|Noun|Useful Abstract Words|beginner
答案|answer|Noun|Useful Abstract Words|beginner
例子|example|Noun|Useful Abstract Words|beginner
经验|experience|Noun|Useful Abstract Words|elementary
计划|plan|Noun|Useful Abstract Words|beginner
目标|goal|Noun|Useful Abstract Words|elementary
希望|hope|Noun|Useful Abstract Words|beginner
梦想|dream|Noun|Useful Abstract Words|beginner
生活|life|Noun|Useful Abstract Words|beginner
世界|world|Noun|Useful Abstract Words|beginner
社会|society|Noun|Useful Abstract Words|elementary
文化|culture|Noun|Useful Abstract Words|elementary
历史|history|Noun|Useful Abstract Words|elementary
未来|future|Noun|Useful Abstract Words|elementary
过去|past|Noun|Useful Abstract Words|elementary
现在|present;now|Noun|Useful Abstract Words|beginner

''' 

# Add a substantial set of common compound vocabulary in themed blocks.
extra = r'''
北京|Beijing|Noun|Places & Geography|beginner
上海|Shanghai|Noun|Places & Geography|beginner
广州|Guangzhou|Noun|Places & Geography|elementary
深圳|Shenzhen|Noun|Places & Geography|elementary
香港|Hong Kong|Noun|Places & Geography|beginner
澳门|Macau|Noun|Places & Geography|elementary
台湾|Taiwan|Noun|Places & Geography|elementary
亚洲|Asia|Noun|Places & Geography|elementary
欧洲|Europe|Noun|Places & Geography|elementary
非洲|Africa|Noun|Places & Geography|elementary
美国|United States|Noun|Places & Geography|beginner
英国|United Kingdom|Noun|Places & Geography|beginner
法国|France|Noun|Places & Geography|elementary
德国|Germany|Noun|Places & Geography|elementary
日本|Japan|Noun|Places & Geography|beginner
韩国|South Korea|Noun|Places & Geography|beginner
加拿大|Canada|Noun|Places & Geography|elementary
澳大利亚|Australia|Noun|Places & Geography|elementary
国家|country|Noun|Places & Geography|beginner
首都|capital city|Noun|Places & Geography|elementary
北方|north|Noun|Places & Geography|elementary
南方|south|Noun|Places & Geography|elementary
东方|east|Noun|Places & Geography|elementary
西方|west|Noun|Places & Geography|elementary
东边|east side|Noun|Places & Geography|beginner
西边|west side|Noun|Places & Geography|beginner
南边|south side|Noun|Places & Geography|beginner
北边|north side|Noun|Places & Geography|beginner
附近|nearby|Noun|Places & Geography|beginner
远|far|Adjective|Descriptions|beginner
近|near|Adjective|Descriptions|beginner

回答|answer|Verb|Communication|beginner
告诉|tell|Verb|Communication|beginner
聊天|chat|Verb|Communication|beginner
谈|talk;discuss|Verb|Communication|elementary
谈话|conversation|Noun|Communication|elementary
说话|speak;talk|Verb|Communication|beginner
语言|language|Noun|Communication|beginner
声音|sound;voice|Noun|Communication|beginner
意思|meaning|Noun|Communication|beginner
句子|sentence|Noun|Communication|beginner
词|word|Noun|Communication|beginner
词语|word;expression|Noun|Communication|elementary
名字|name|Noun|Communication|beginner
介绍|introduce|Verb|Communication|beginner
说明|explain|Verb|Communication|elementary
表达|express|Verb|Communication|elementary
翻译|translate;translation|Verb|Communication|elementary
阅读|reading|Noun|Communication|elementary
写作|writing|Noun|Communication|elementary
听力|listening comprehension|Noun|Communication|elementary
口语|spoken language|Noun|Communication|elementary
发音|pronunciation|Noun|Communication|beginner
拼音|Pinyin|Noun|Communication|beginner
汉语|Chinese language|Noun|Communication|beginner
普通话|Mandarin Chinese|Noun|Communication|beginner
中文|Chinese language|Noun|Communication|beginner

穿|wear;put on|Verb|Clothing|beginner
戴|wear;put on (accessories)|Verb|Clothing|beginner
衣服|clothes|Noun|Clothing|beginner
衬衫|shirt|Noun|Clothing|beginner
T恤|T-shirt|Noun|Clothing|beginner
牛仔裤|jeans|Noun|Clothing|beginner
短裤|shorts|Noun|Clothing|beginner
鞋|shoe|Noun|Clothing|beginner
袜子|socks|Noun|Clothing|beginner
帽子|hat|Noun|Clothing|beginner
手套|gloves|Noun|Clothing|beginner
围巾|scarf|Noun|Clothing|beginner
眼镜|glasses|Noun|Clothing|beginner
戒指|ring|Noun|Clothing|elementary
手表|watch|Noun|Clothing|beginner

刀|knife|Noun|Objects|beginner
杯子|cup|Noun|Objects|beginner
瓶子|bottle|Noun|Objects|beginner
盘子|plate|Noun|Objects|beginner
碗|bowl|Noun|Objects|beginner
筷子|chopsticks|Noun|Objects|beginner
勺子|spoon|Noun|Objects|beginner
叉子|fork|Noun|Objects|beginner
纸|paper|Noun|Objects|beginner
笔|pen|Noun|Objects|beginner
铅笔|pencil|Noun|Objects|beginner
本子|notebook|Noun|Objects|beginner
书包|schoolbag|Noun|Objects|beginner
箱子|box|Noun|Objects|beginner
袋子|bag|Noun|Objects|beginner
钥匙|key|Noun|Objects|beginner
雨伞|umbrella|Noun|Objects|beginner
镜子|mirror|Noun|Objects|beginner
毛巾|towel|Noun|Objects|beginner
牙刷|toothbrush|Noun|Objects|beginner

玩|play|Verb|Leisure|beginner
玩儿|play;have fun|Verb|Leisure|beginner
唱|sing|Verb|Leisure|beginner
跳|jump;dance|Verb|Leisure|beginner
跳舞|dance|Verb|Leisure|beginner
画|draw;paint|Verb|Leisure|beginner
照相|take a photo|Verb|Leisure|beginner
看书|read books|Verb|Leisure|beginner
看电影|watch a movie|Verb|Leisure|beginner
听音乐|listen to music|Verb|Leisure|beginner
下棋|play chess|Verb|Leisure|elementary
钓鱼|fish|Verb|Leisure|elementary
旅行|travel|Verb|Leisure|beginner
度假|go on vacation|Verb|Leisure|elementary

见|see;meet|Verb|Social|beginner
见面|meet|Verb|Social|beginner
认识|know;meet|Verb|Social|beginner
欢迎|welcome|Verb|Social|beginner
谢谢|thank you|Phrase|Social|beginner
感谢|thank;thanks|Verb|Social|elementary
请|please;invite|Verb|Social|beginner
对不起|sorry|Phrase|Social|beginner
抱歉|sorry|Adjective|Social|elementary
没关系|it doesn't matter|Phrase|Social|beginner
再见|goodbye|Phrase|Social|beginner
你好|hello|Phrase|Social|beginner
早安|good morning|Phrase|Social|beginner
晚安|good night|Phrase|Social|beginner
欢迎|welcome|Verb|Social|beginner
祝|wish|Verb|Social|elementary
祝福|blessing;wish well|Noun|Social|elementary
生日|birthday|Noun|Social|beginner
生日快乐|happy birthday|Phrase|Social|beginner
新年|New Year|Noun|Social|beginner
春节|Spring Festival|Noun|Social|elementary

安全|safe;safety|Adjective|Safety & Rules|beginner
危险|dangerous|Adjective|Safety & Rules|beginner
小心|be careful|Verb|Safety & Rules|beginner
注意|pay attention|Verb|Safety & Rules|beginner
当心|watch out|Verb|Safety & Rules|elementary
禁止|prohibit;forbid|Verb|Safety & Rules|elementary
允许|allow|Verb|Safety & Rules|elementary
可以|may;can|Verb|Safety & Rules|beginner
必须|must|Verb|Safety & Rules|elementary
需要|need|Verb|Safety & Rules|beginner
规则|rule|Noun|Safety & Rules|elementary
办法|way;solution|Noun|Safety & Rules|beginner
帮助|help|Verb|Safety & Rules|beginner
警察|police|Noun|Safety & Rules|beginner
消防员|firefighter|Noun|Safety & Rules|elementary

发现|discover|Verb|Thinking & Learning|elementary
了解|understand;learn about|Verb|Thinking & Learning|elementary
理解|understand|Verb|Thinking & Learning|elementary
记得|remember|Verb|Thinking & Learning|beginner
忘记|forget|Verb|Thinking & Learning|beginner
想起|remember;recall|Verb|Thinking & Learning|elementary
认为|think;believe|Verb|Thinking & Learning|elementary
觉得|feel;think|Verb|Thinking & Learning|beginner
考虑|consider|Verb|Thinking & Learning|elementary
决定|decide|Verb|Thinking & Learning|elementary
计划|plan|Verb|Thinking & Learning|elementary
准备|prepare|Verb|Thinking & Learning|beginner
练习|practice|Verb|Thinking & Learning|beginner
学习|learn|Verb|Thinking & Learning|beginner
研究|study;research|Verb|Thinking & Learning|elementary
检查|check|Verb|Thinking & Learning|elementary
测试|test|Verb|Thinking & Learning|elementary
比较|compare|Verb|Thinking & Learning|elementary
选择|choose|Verb|Thinking & Learning|elementary
需要|need|Verb|Thinking & Learning|beginner

得到|get;obtain|Verb|Actions|elementary
拿到|get;receive|Verb|Actions|beginner
放下|put down|Verb|Actions|beginner
拿走|take away|Verb|Actions|beginner
带来|bring|Verb|Actions|beginner
带走|take away|Verb|Actions|beginner
送来|send;bring|Verb|Actions|elementary
拿|take;hold|Verb|Actions|beginner
放|put|Verb|Actions|beginner
开|open;drive|Verb|Actions|beginner
关|close;turn off|Verb|Actions|beginner
打开|open|Verb|Actions|beginner
关上|close|Verb|Actions|beginner
穿上|put on|Verb|Actions|beginner
脱掉|take off|Verb|Actions|beginner
起来|get up;rise|Verb|Actions|beginner
坐下|sit down|Verb|Actions|beginner
站起来|stand up|Verb|Actions|beginner
进去|go in|Verb|Actions|beginner
出来|come out|Verb|Actions|beginner
回去|go back|Verb|Actions|beginner
回来|come back|Verb|Actions|beginner

聪明|smart|Adjective|Personal Qualities|beginner
认真|serious;conscientious|Adjective|Personal Qualities|elementary
努力|hardworking;make an effort|Adjective|Personal Qualities|beginner
懒|lazy|Adjective|Personal Qualities|beginner
友好|friendly|Adjective|Personal Qualities|beginner
善良|kind|Adjective|Personal Qualities|elementary
勇敢|brave|Adjective|Personal Qualities|elementary
诚实|honest|Adjective|Personal Qualities|elementary
耐心|patient|Adjective|Personal Qualities|elementary
小气|stingy|Adjective|Personal Qualities|elementary
大方|generous;natural|Adjective|Personal Qualities|elementary
热情|enthusiastic;warm|Adjective|Personal Qualities|elementary
礼貌|polite|Adjective|Personal Qualities|elementary

工作|work|Noun|Work & Business|beginner
上班|go to work|Verb|Work & Business|beginner
下班|finish work|get off work|Verb|Work & Business|beginner
开会|have a meeting|Verb|Work & Business|elementary
开工|start work|Verb|Work & Business|elementary
加班|work overtime|Verb|Work & Business|elementary
休假|take leave|Verb|Work & Business|elementary
工资|salary|Noun|Work & Business|elementary
收入|income|Noun|Work & Business|elementary
工作经验|work experience|Noun|Work & Business|elementary
公司|company|Noun|Work & Business|beginner
部门|department|Noun|Work & Business|elementary
经理|manager|Noun|Work & Business|elementary
秘书|secretary|Noun|Work & Business|elementary
员工|employee|Noun|Work & Business|elementary
同事|colleague|Noun|Work & Business|elementary
会议|meeting|Noun|Work & Business|elementary
项目|project|Noun|Work & Business|elementary
任务|task|Noun|Work & Business|elementary
报告|report|Noun|Work & Business|elementary
文件|document|Noun|Work & Business|beginner
邮件|email|Noun|Work & Business|beginner

上|up;above|Preposition|Position & Direction|beginner
下|down;below|Preposition|Position & Direction|beginner
前|front;before|Noun|Position & Direction|beginner
后|back;after|Noun|Position & Direction|beginner
左|left|Noun|Position & Direction|beginner
右|right|Noun|Position & Direction|beginner
里|inside|Noun|Position & Direction|beginner
外|outside|Noun|Position & Direction|beginner
中|middle|Noun|Position & Direction|beginner
旁边|beside|Noun|Position & Direction|beginner
中间|middle|Noun|Position & Direction|beginner
上面|above;on|Noun|Position & Direction|beginner
下面|below|Noun|Position & Direction|beginner
前面|in front|Noun|Position & Direction|beginner
后面|behind|Noun|Position & Direction|beginner
左边|left side|Noun|Position & Direction|beginner
右边|right side|Noun|Position & Direction|beginner
里面|inside|Noun|Position & Direction|beginner
外面|outside|Noun|Position & Direction|beginner
对面|opposite side|Noun|Position & Direction|elementary
附近|nearby|Noun|Position & Direction|beginner
远处|far away|Noun|Position & Direction|elementary
方向|direction|Noun|Position & Direction|elementary

星期|week|Noun|Time & Dates|beginner
周末|weekend|Noun|Time & Dates|beginner
周一|Monday|Noun|Time & Dates|beginner
周二|Tuesday|Noun|Time & Dates|beginner
周三|Wednesday|Noun|Time & Dates|beginner
周四|Thursday|Noun|Time & Dates|beginner
周五|Friday|Noun|Time & Dates|beginner
周六|Saturday|Noun|Time & Dates|beginner
周日|Sunday|Noun|Time & Dates|beginner
今年|this year|Noun|Time & Dates|beginner
去年|last year|Noun|Time & Dates|beginner
明年|next year|Noun|Time & Dates|beginner
上个月|last month|Noun|Time & Dates|beginner
这个月|this month|Noun|Time & Dates|beginner
下个月|next month|Noun|Time & Dates|beginner
今天早上|this morning|Phrase|Time & Dates|beginner
今晚|tonight|Noun|Time & Dates|beginner
明早|tomorrow morning|Noun|Time & Dates|elementary
一会儿|a little while|Phrase|Time & Dates|beginner
马上|right away|Adverb|Time & Dates|beginner

''' 

# Parse entries
entries=[]
for block in (raw, extra):
    for line in block.strip().splitlines():
        parts=line.split('|')
        if len(parts)!=5: continue
        w,m,pos,cat,diff=parts
        entries.append((w,m,pos,cat,diff))

# Load existing
payload=json.loads(ZH.read_text(encoding='utf8'))
items=payload['items']
existing={(x.get('languageVariant'),x.get('word')) for x in items}
# Remove duplicates inside expansion and anything already present.
seen=set(); candidates=[]
for e in entries:
    key=('zh-cmn',e[0])
    if key in existing or key in seen: continue
    seen.add(key); candidates.append(e)

# Pinyin database from TeX; fallback leaves a clear review marker.
text=DB.read_text(encoding='utf8',errors='ignore')
mapch={}
for ch,code,pin in re.findall(r'\\XPYU\{(.+?)\}\{(\d+)\}\{(.+?)\}',text):
    mapch[ch]=pin
# Common phrase/polyphone overrides.
overrides={
'银行':'yínháng','行为':'xíngwéi','行李':'xíngli','行动':'xíngdòng','银行':'yínháng','长大':'zhǎngdà','长度':'chángdù',
'音乐':'yīnyuè','快乐':'kuàilè','喜欢':'xǐhuan','觉得':'juéde','知道':'zhīdào','认识':'rènshi','漂亮':'piàoliang','东西':'dōngxi',
'时间':'shíjiān','时候':'shíhou','多少':'duōshao','什么':'shénme','怎么':'zěnme','为什么':'wèishénme','哪里':'nǎlǐ','哪儿':'nǎr',
'多少':'duōshao','一个':'yí ge','一个':'yí ge','一起':'yìqǐ','一点':'yìdiǎn','一些':'yìxiē','很多':'hěn duō',
'一半':'yíbàn','第一':'dìyī','第二':'dìèr','几乎':'jīhū','今天':'jīntiān','昨天':'zuótiān','明天':'míngtiān',
'星期一':'xīngqīyī','星期二':'xīngqīèr','星期三':'xīngqīsān','星期四':'xīngqīsì','星期五':'xīngqīwǔ','星期六':'xīngqīliù','星期天':'xīngqītiān',
'星期':'xīngqī','普通话':'pǔtōnghuà','汉语':'hànyǔ','汉字':'hànzì','中文':'zhōngwén','拼音':'pīnyīn',
'医院':'yīyuàn','银行':'yínháng','公司':'gōngsī','城市':'chéngshì','国家':'guójiā','地方':'dìfang','东西':'dōngxi',
'喜欢':'xǐhuan','希望':'xīwàng','需要':'xūyào','应该':'yīnggāi','必须':'bìxū','可以':'kěyǐ','可能':'kěnéng',
'因为':'yīnwèi','所以':'suǒyǐ','但是':'dànshì','可是':'kěshì','如果':'rúguǒ','虽然':'suīrán','然后':'ránhòu','而且':'érqiě',
'或者':'huòzhě','还是':'háishi','除了':'chúle','关于':'guānyú','对于':'duìyú','根据':'gēnjù','通过':'tōngguò','为了':'wèile',
'现在':'xiànzài','已经':'yǐjīng','正在':'zhèngzài','最近':'zuìjìn','将来':'jiānglái','过去':'guòqù','马上':'mǎshàng','当然':'dāngrán',
'其实':'qíshí','特别':'tèbié','非常':'fēicháng','比较':'bǐjiào','大概':'dàgài','安全':'ānquán','危险':'wēixiǎn',
'早餐':'zǎocān','午餐':'wǔcān','晚餐':'wǎncān','午饭':'wǔfàn','晚饭':'wǎnfàn','餐厅':'cāntīng','饭馆':'fànguǎn',
'水果':'shuǐguǒ','蔬菜':'shūcài','鸡蛋':'jīdàn','鸡肉':'jīròu','牛肉':'niúròu','猪肉':'zhūròu','米饭':'mǐfàn','面条':'miàntiáo',
'牛奶':'niúnǎi','咖啡':'kāfēi','果汁':'guǒzhī','西瓜':'xīguā','葡萄':'pútáo','草莓':'cǎoméi','味道':'wèidào',
'房间':'fángjiān','卧室':'wòshì','客厅':'kètīng','厨房':'chúfáng','卫生间':'wèishēngjiān','洗衣机':'xǐyījī','微波炉':'wēibōlú',
'电脑':'diànnǎo','手机':'shǒujī','电话':'diànhuà','网络':'wǎngluò','网站':'wǎngzhàn','软件':'ruǎnjiàn','程序':'chéngxù','文件':'wénjiàn',
'照片':'zhàopiàn','图片':'túpiàn','视频':'shìpín','下载':'xiàzài','上传':'shàngchuán','发送':'fāsòng','接收':'jiēshōu','保存':'bǎocún',
'删除':'shānchú','搜索':'sōusuǒ','点击':'diǎnjī','登录':'dēnglù','退出':'tuìchū','更新':'gēngxīn','安装':'ānzhuāng',
'天气':'tiānqì','太阳':'tàiyáng','月亮':'yuèliang','天空':'tiānkōng','春天':'chūntiān','夏天':'xiàtiān','秋天':'qiūtiān','冬天':'dōngtiān',
'动物':'dòngwù','北京':'Běijīng','上海':'Shànghǎi','广州':'Guǎngzhōu','深圳':'Shēnzhèn','香港':'Xiānggǎng','澳门':'Àomén','台湾':'Táiwān',
'美国':'Měiguó','英国':'Yīngguó','法国':'Fǎguó','德国':'Déguó','日本':'Rìběn','韩国':'Hánguó','加拿大':'Jiānádà','澳大利亚':'Àodàlìyà',
'春节':'Chūnjié','生日快乐':'shēngrì kuàilè','谢谢':'xièxie','对不起':'duìbuqǐ','没关系':'méiguānxi','再见':'zàijiàn','你好':'nǐhǎo','早安':'zǎoān','晚安':'wǎnān',
'小心':'xiǎoxīn','注意':'zhùyì','当心':'dāngxīn','禁止':'jìnzhǐ','允许':'yǔnxǔ','规则':'guīzé','警察':'jǐngchá','消防员':'xiāofángyuán',
'工作经验':'gōngzuò jīngyàn','工作':'gōngzuò','上班':'shàngbān','下班':'xiàbān','开会':'kāihuì','加班':'jiābān','工资':'gōngzī','收入':'shōurù','项目':'xiàngmù','任务':'rènwu','报告':'bàogào',
'普通':'pǔtōng','认真':'rènzhēn','努力':'nǔlì','友好':'yǒuhǎo','善良':'shànliáng','勇敢':'yǒnggǎn','诚实':'chéngshí','耐心':'nàixīn','热情':'rèqíng','礼貌':'lǐmào',
'聪明':'cōngming','漂亮':'piàoliang','可爱':'kěài','容易':'róngyì','复杂':'fùzá','重要':'zhòngyào','方便':'fāngbiàn','安静':'ānjìng','热闹':'rènao','干净':'gānjìng',
'高兴':'gāoxìng','开心':'kāixīn','难过':'nánguò','伤心':'shāngxīn','生气':'shēngqì','害怕':'hàipà','担心':'dānxīn','紧张':'jǐnzhāng','放心':'fàngxīn','讨厌':'tǎoyàn',
'得到':'dé dào','拿到':'ná dào','放下':'fàngxià','拿走':'ná zǒu','带来':'dài lái','带走':'dài zǒu','送来':'sòng lái','穿上':'chuān shàng','脱掉':'tuō diào','坐下':'zuò xià','站起来':'zhàn qǐlái',
'进去':'jìnqù','出来':'chūlái','回去':'huíqù','回来':'huílái','上去':'shàngqù','下来':'xiàlái','过来':'guòlái','过去':'guòqù',
'周末':'zhōumò','今年':'jīnnián','去年':'qùnián','明年':'míngnián','上个月':'shàng ge yuè','这个月':'zhège yuè','下个月':'xià ge yuè','今晚':'jīnwǎn','一会儿':'yíhuìr',
}

def pinyin_for(word):
    if word in overrides: return overrides[word]
    out=[]
    for ch in word:
        if ch in mapch: out.append(mapch[ch])
        elif ch.isspace() or ch in '-': out.append(ch)
        else: out.append('')
    return ' '.join(x for x in out if x).strip()

def tones(p):
    # derive tone numbers from diacritics; neutral tone is 5
    vowels={'ā':1,'á':2,'ǎ':3,'à':4,'ē':1,'é':2,'ě':3,'è':4,'ī':1,'í':2,'ǐ':3,'ì':4,'ō':1,'ó':2,'ǒ':3,'ò':4,'ū':1,'ú':2,'ǔ':3,'ù':4,'ǖ':1,'ǘ':2,'ǚ':3,'ǜ':4}
    nums=[]
    for syl in p.split():
        n=5
        for c in syl:
            if c in vowels: n=vowels[c]; break
        nums.append(n)
    return nums

def make_example(word,pos,meaning,pinyin):
    if pos in ('Verb',):
        native=f'我会{word}。'; trans=f'I can {meaning.split(";")[0].replace("to ","")}. '
    elif pos=='Adjective':
        native=f'这个很{word}。'; trans=f'This is very {meaning.split(";")[0]}. '
    elif pos=='Pronoun':
        native=f'{word}是谁？'; trans=f'Who is {word}? '
    elif pos in ('Conjunction','Preposition','Particle','Adverb'):
        native=f'我{word}知道。'; trans=f'I know. ({meaning.split(";")[0]}) '
    elif pos=='Phrase':
        native=f'他说：“{word}。”'; trans=f'He said, “{meaning.split(";")[0]}.” '
    else:
        native=f'这是{word}。'; trans=f'This is {meaning.split(";")[0]}. '
    return {'native':native,'pronunciation':pinyin,'translation':trans.strip()}

# Avoid duplicates, and cap expansion to 850 so Mandarin reaches ~1000 while keeping a future review buffer.
added=0
max_new=850
next_num=1
for w,m,pos,cat,diff in candidates:
    if added>=max_new: break
    pin=pinyin_for(w)
    if not pin: continue
    # Reject obvious unmapped or malformed pinyin.
    if any(ord(c)>127 and unicodedata.category(c).startswith('L') for c in pin if c not in 'āáǎàēéěèīíǐìōóǒòūúǔǖǘǚǜ'): continue
    tones_list=tones(pin)
    rank=500+added
    band='high' if rank<=1000 else ('medium' if rank<=3000 else 'low')
    score=25 if diff=='beginner' else (45 if diff=='elementary' else 60)
    item={
      'id':f'zh-cmn-exp-{added+1:04d}',
      'languageId':'zh','languageVariant':'zh-cmn','itemType':'word' if pos not in ('Phrase',) else 'phrase',
      'word':w,'displayText':w,'meaning':m,'pronunciation':pin,'romanization':pin,'pronunciationSystem':'pinyin',
      'partOfSpeech':pos,'category':cat,'difficulty':diff,'difficultyScore':score,'frequencyRank':rank,'frequencyBand':band,
      'languageSpecific':{'type':'mandarin','data':{'simplified':w,'traditional':w,'pinyin':pin,'tones':tones_list}},
      'tags':['mandarin','pinyin',cat.lower(),pos.lower(),'expansion'],
      'isCurated':True,
      'contentQuality':{'tier':'seed-curated','status':'seed-review-required','score':74,'trustedForCoreLearning':False,'source':'Linguadaily Mandarin curated expansion'},
      'examples':[make_example(w,pos,m,pin)]
    }
    items.append(item); added+=1

# Normalize frequency ranks for Mandarin entries while preserving existing ranks.
mand=[x for x in items if x.get('languageVariant')=='zh-cmn']
# Keep existing ranks; assign expansion after max existing rank.
max_existing=max([x.get('frequencyRank',0) for x in items if x.get('languageVariant')=='zh-cmn' and not str(x.get('id','')).startswith('zh-cmn-exp-')] or [0])
for i,x in enumerate([x for x in mand if str(x.get('id','')).startswith('zh-cmn-exp-')], start=1):
    x['frequencyRank']=max_existing+i
    x['frequencyBand']='high' if x['frequencyRank']<=1000 else ('medium' if x['frequencyRank']<=3000 else 'low')

payload['items']=items
ZH.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(f'Added {added} Mandarin items; Mandarin total={len(mand)}; Chinese total={len(items)}')
