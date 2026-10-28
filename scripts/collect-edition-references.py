"""Download official product references for local visual inspection only."""
import concurrent.futures, html, json, re, urllib.request
from pathlib import Path
root=Path(__file__).resolve().parents[1]
out=root/'assets/references/catalog';out.mkdir(parents=True,exist_ok=True)
pages={
 'ff16':'https://blog.ja.playstation.com/2023/04/27/20230427-ff16/',
 'lebron':'https://blog.playstation.com/2023/03/01/playstation-and-lebron-james-team-up-on-limited-edition-playstation-5-accessories/',
 'fortnite':'https://blog.playstation.com/?p=396503',
 'helldivers':'https://blog.playstation.com/?p=399483',
 'lastofus':'https://blog.playstation.com/?p=402444',
}
def read(url):
 return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=45).read()
def collect(item):
 key,url=item
 try:
  s=read(url).decode();(out/(key+'.html')).write_text(s,encoding='utf-8')
  images=list(dict.fromkeys(re.findall(r'https://(?:blog\.[^/]+/tachyon/[^\s"<>?]+|gmedia\.playstation\.com/is/image/[^\s"<>?]+)',s)))
  images=[html.unescape(u) for u in images if re.search(r'\.(?:jpg|png|webp)$',u,re.I)][:18]
  return key,[{'url':u,'file':f'{key}-{i}.jpg'} for i,u in enumerate(images)]
 except Exception as e:print(key,str(e));return key,[]
manifest=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
 for key,items in pool.map(collect,pages.items()):manifest+=items
s=(root/'assets/references/detail/gt.html').read_text(encoding='utf-8')
urls=list(dict.fromkeys(re.findall(r'https://gmedia\.playstation\.com/is/image/[^\s"<>?]+',s)))
for key,pattern in {'marathon':'Marathon-01-16x9','deathstranding':'DeathStranding2-01-16x9','yotei-black':'GoY01_Black-16x9','007':'FirstLight-PR-01-16x9','lisa':'LISA-PR-01-16x9','camo':'GrayCamo01-16x9'}.items():
 for url in urls:
  if pattern in url:manifest.append({'url':url+'?wid=1600','file':key+'-front.jpg'})
def download(item):
 try:
  target=out/item['file']
  if not target.exists():target.write_bytes(read(item['url']))
 except Exception as e:print(item['file'],str(e))
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:list(pool.map(download,manifest))
(out/'sources.json').write_text(json.dumps({'pages':pages,'images':manifest},indent=2),encoding='utf-8')
from PIL import Image,ImageOps,ImageDraw
files=[p for p in out.glob('*.jpg') if p.stat().st_size>5000]
sheet=Image.new('RGB',(1000,180*((len(files)+3)//4)), '#ddd');draw=ImageDraw.Draw(sheet)
for i,p in enumerate(files):
 try:
  im=ImageOps.contain(Image.open(p).convert('RGB'),(245,150));x=i%4*250;y=i//4*180;sheet.paste(im,(x,y));draw.text((x+5,y+152),p.name,fill='black')
 except Exception:pass
sheet.save(out/'contact.jpg');print('Saved',len(files),'references')
