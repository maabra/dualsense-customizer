"""Collect more official reference angles without publishing source photographs."""
import concurrent.futures,html,json,re,urllib.request
from pathlib import Path
root=Path(__file__).resolve().parents[1];out=root/'assets/references/pass2';out.mkdir(parents=True,exist_ok=True)
pages={
 'spiderman':'https://www.playstation.com/en-gb/games/marvels-spider-man-2/limited-editions/',
 'godofwar':'https://blog.playstation.com/2022/09/13/the-god-of-war-ragnarok-story-trailer-is-now-live/',
 'yotei-gold':'https://blog.playstation.com/2025/07/10/first-look-ps5-ghost-of-yotei-limited-edition-console-designs/',
}
def read(url):return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=45).read()
manifest=[]
for key,url in pages.items():
 try:
  s=read(url).decode();(out/(key+'.html')).write_text(s,encoding='utf-8')
  if key=='spiderman':urls=re.findall(r'https://gmedia\.playstation\.com/is/image/[^\s"<>?]+',s)
  else:urls=re.findall(r'https://blog\.[^/]+/tachyon/[^\s"<>?]+',s.split('entry-content',1)[-1])[:60]
  for i,u in enumerate(dict.fromkeys(urls)):
   if key=='spiderman' and not re.search('dualsense|controller|DSWC',u,re.I):continue
   if key!='spiderman' and not re.search(r'\.(jpg|png|webp)$',u,re.I):continue
   manifest.append({'edition':key,'url':html.unescape(u)+('?wid=1800' if key=='spiderman' else ''),'file':f'{key}-{i}.jpg'})
 except Exception as e:print(key,e)
s=(root/'assets/references/detail/gt.html').read_text(encoding='utf-8')
for key,pattern in {'marathon':'Marathon-','deathstranding':'DeathStranding2-','yotei-black':'GoY','007':'FirstLight-','lisa':'LISA-PR-'}.items():
 for u in dict.fromkeys(re.findall(r'https://gmedia\.playstation\.com/is/image/[^\s"<>?]+',s)):
  if pattern in u and '16x9' in u and any(p in u for p in ['-02-','-03-','-04-','-05-','02_Black','03_Black','04_Black','05_Black']):
   i=sum(x['edition']==key for x in manifest);manifest.append({'edition':key,'url':u+'?wid=1600','file':f'{key}-angle-{i}.jpg'})
def download(row):
 try:
  p=out/row['file']
  if not p.exists():p.write_bytes(read(row['url']))
 except Exception as e:print(row['file'],e)
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:list(pool.map(download,manifest))
(out/'sources.json').write_text(json.dumps({'pages':pages,'images':manifest},indent=2),encoding='utf-8')
from PIL import Image,ImageOps,ImageDraw
files=[out/r['file'] for r in manifest if (out/r['file']).exists()]
sheet=Image.new('RGB',(1200,210*((len(files)+3)//4)),'#ddd');d=ImageDraw.Draw(sheet)
for i,p in enumerate(files):
 try:
  im=ImageOps.contain(Image.open(p).convert('RGB'),(295,180));x=i%4*300;y=i//4*210;sheet.paste(im,(x,y));d.text((x+4,y+185),p.name,fill='black')
 except Exception:pass
sheet.save(out/'contact.jpg');print('Collected',len(files),'views')
