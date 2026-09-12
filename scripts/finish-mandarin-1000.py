import json, re
from pathlib import Path
ROOT=Path('/mnt/ldai/current'); p=ROOT/'public/data/languages/zh.json'; d=json.loads(p.read_text(encoding='utf8')); items=d['items']
existing={x['word'] for x in items if x.get('languageVariant')=='zh-cmn'}
rows='''
上午|morning|Noun|Time & Dates|beginner
下午|afternoon|Noun|Time & Dates|beginner
今晚|tonight|Noun|Time & Dates|beginner
去年|last year|Noun|Time & Dates|beginner
明年|next year|Noun|Time & Dates|beginner
每个月|every month|Adverb|Time & Dates|beginner
有时候|sometimes|Adverb|Time & Dates|beginner
经常|often|Adverb|Time & Dates|beginner
从来|ever;always (in negative)|Adverb|Time & Dates|elementary
刚刚|just now|Adverb|Time & Dates|beginner
已经|already|Adverb|Time & Dates|beginner
还没有|not yet|Phrase|Time & Dates|beginner
一起|together|Adverb|Everyday Expressions|beginner
一样|same|Adjective|Descriptions|beginner
一样的|the same|Adjective|Descriptions|beginner
不同|different|Adjective|Descriptions|beginner
清楚|clear|Adjective|Descriptions|beginner
漂亮|beautiful|Adjective|Descriptions|beginner
舒服|comfortable|Adjective|Descriptions|beginner
难受|uncomfortable;feel ill|Adjective|Health & Body|elementary
健康|healthy;health|Adjective|Health & Body|beginner
正常|normal|Adjective|Descriptions|elementary
方便|convenient|Adjective|Descriptions|beginner
麻烦|troublesome|Adjective|Descriptions|elementary
简单|simple|Adjective|Descriptions|beginner
认真|serious;conscientious|Adjective|Personal Qualities|elementary
特别|special;especially|Adjective|Descriptions|beginner
主要|main;principal|Adjective|Descriptions|elementary
一般|ordinary;generally|Adjective|Descriptions|elementary
完整|complete|Adjective|Descriptions|elementary
可能|possible|Adjective|Descriptions|elementary
一定|certain;definite|Adjective|Descriptions|elementary
当然|of course|Adverb|Everyday Expressions|beginner
其实|actually|Adverb|Everyday Expressions|elementary
已经|already|Adverb|Everyday Expressions|beginner
终于|finally|Adverb|Everyday Expressions|elementary
马上|immediately|Adverb|Everyday Expressions|beginner
一起|together|Adverb|Everyday Expressions|beginner
尤其|especially|Adverb|Everyday Expressions|elementary
当然|of course|Adverb|Everyday Expressions|beginner
真的|really|Adverb|Everyday Expressions|beginner
刚才|just now|Noun|Time & Dates|beginner
突然|suddenly|Adverb|Everyday Expressions|elementary
已经|already|Adverb|Everyday Expressions|beginner
准备好|be ready|Verb|Daily Life|beginner
洗手|wash hands|Verb|Daily Life|beginner
关灯|turn off the light|Verb|Daily Life|beginner
开灯|turn on the light|Verb|Daily Life|beginner
开车|drive a car|Verb|Movement & Travel|beginner
坐车|take a vehicle|Verb|Movement & Travel|beginner
坐飞机|take a plane|Verb|Movement & Travel|beginner
坐地铁|take the subway|Verb|Movement & Travel|beginner
坐公交车|take the bus|Verb|Movement & Travel|beginner
买东西|shop;buy things|Verb|Shopping & Money|beginner
吃饭|eat a meal|Verb|Food & Drink|beginner
喝水|drink water|Verb|Food & Drink|beginner
喝茶|drink tea|Verb|Food & Drink|beginner
睡觉|sleep|Verb|Daily Life|beginner

'''
# use existing pinyin helper data from prior script
import re
DB=Path('/usr/share/texlive/texmf-dist/tex/latex/xpinyin/xpinyin-database.def').read_text(encoding='utf8',errors='ignore')
mapch={ch:pin for ch,code,pin in re.findall(r"\\XPYU\{(.+?)\}\{(\d+)\}\{(.+?)\}",DB)}
overrides={'上午':'shàngwǔ','下午':'xiàwǔ','今晚':'jīnwǎn','去年':'qùnián','明年':'míngnián','每个月':'měi ge yuè','有时候':'yǒu shíhou','经常':'jīngcháng','从来':'cónglái','刚刚':'gānggāng','已经':'yǐjīng','还没有':'hái méiyǒu','一起':'yìqǐ','一样':'yíyàng','一样的':'yíyàng de','不同':'bùtóng','清楚':'qīngchu','漂亮':'piàoliang','舒服':'shūfu','难受':'nánshòu','健康':'jiànkāng','正常':'zhèngcháng','方便':'fāngbiàn','麻烦':'máfan','简单':'jiǎndān','认真':'rènzhēn','特别':'tèbié','主要':'zhǔyào','一般':'yìbān','完整':'wánzhěng','可能':'kěnéng','一定':'yídìng','当然':'dāngrán','其实':'qíshí','终于':'zhōngyú','马上':'mǎshàng','尤其':'yóuqí','真的':'zhēnde','刚才':'gāngcái','突然':'tūrán','准备好':'zhǔnbèi hǎo','洗手':'xǐshǒu','关灯':'guāndēng','开灯':'kāidēng','开车':'kāichē','坐车':'zuò chē','坐飞机':'zuò fēijī','坐地铁':'zuò dìtiě','坐公交车':'zuò gōngjiāo chē','买东西':'mǎi dōngxi','吃饭':'chīfàn','喝水':'hē shuǐ','喝茶':'hē chá','睡觉':'shuìjiào'}
def pinyin_for(w):
 if w in overrides:return overrides[w]
 return ' '.join(mapch.get(c,'') for c in w).strip()
def tones(p):
 v={'ā':1,'á':2,'ǎ':3,'à':4,'ē':1,'é':2,'ě':3,'è':4,'ī':1,'í':2,'ǐ':3,'ì':4,'ō':1,'ó':2,'ǒ':3,'ò':4,'ū':1,'ú':2,'ǔ':3,'ù':4,'ǖ':1,'ǘ':2,'ǚ':3,'ǜ':4}
 return [next((v[c] for c in syl if c in v),5) for syl in p.split()]
def make_example(w,pos,m,pin):
 if pos=='Verb': return {'native':f'我会{w}。','pronunciation':pin,'translation':f'I can {m.split(";")[0].replace("to ","")}.'.strip()}
 if pos=='Adjective': return {'native':f'这个很{w}。','pronunciation':pin,'translation':f'This is very {m.split(";")[0]}.'}
 return {'native':f'这是{w}。','pronunciation':pin,'translation':f'This is {m.split(";")[0]}.'}
added=0; max_rank=max(x.get('frequencyRank',0) for x in items if x.get('languageVariant')=='zh-cmn')
seen=set(existing)
for line in rows.strip().splitlines():
 w,m,pos,cat,diff=line.split('|')
 if w in seen: continue
 pin=pinyin_for(w)
 if not pin: continue
 added+=1; seen.add(w); max_rank+=1
 items.append({'id':f'zh-cmn-exp2-{added:04d}','languageId':'zh','languageVariant':'zh-cmn','itemType':'phrase' if ' ' in m and False else 'word','word':w,'displayText':w,'meaning':m,'pronunciation':pin,'romanization':pin,'pronunciationSystem':'pinyin','partOfSpeech':pos,'category':cat,'difficulty':diff,'difficultyScore':25 if diff=='beginner' else 45,'frequencyRank':max_rank,'frequencyBand':'medium','languageSpecific':{'type':'mandarin','data':{'simplified':w,'traditional':w,'pinyin':pin,'tones':tones(pin)}},'tags':['mandarin','pinyin',cat.lower(),pos.lower(),'expansion'],'isCurated':True,'contentQuality':{'tier':'seed-curated','status':'seed-review-required','score':74,'trustedForCoreLearning':False,'source':'Linguadaily Mandarin curated expansion'},'examples':[make_example(w,pos,m,pin)]})
d['items']=items;p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8'); print('added',added,'mandarin',sum(x.get('languageVariant')=='zh-cmn' for x in items),'zh',len(items))
