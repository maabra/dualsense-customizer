"""Collect publicly supplied full-resolution manufacturer reference plates."""
import json,urllib.request,concurrent.futures
from html.parser import HTMLParser
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
root=Path(__file__).resolve().parents[1];out=root/'assets/references/missing';out.mkdir(parents=True,exist_ok=True)
pages={
 'genshin':'https://blog.playstation.com/?p=412516',
 'gow20':'https://blog.playstation.com/2025/09/24/celebrate-kratos-legacy-with-the-dualsense-wireless-controller-god-of-war-20th-anniversary-limited-edition/',
 'iconblue':'https://blog.playstation.com/2025/10/07/first-look-at-the-dualsense-wireless-controller-icon-blue-special-edition-launching-this-october/',
 'monsterhunter':'https://blog.ja.playstation.com/2024/10/23/20241023-ps5/',
}
class Links(HTMLParser):
 def __init__(self):super().__init__();self.href=None;self.links=[]
 def handle_starttag(self,tag,attrs):
  if tag=='a':self.href=dict(attrs).get('href')
 def handle_data(self,data):
  if 'Download this image' in data and self.href:self.links.append(self.href)
 def handle_endtag(self,tag):
  if tag=='a':self.href=None
def get(url):return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=40).read()
records=[]
for edition,page in pages.items():
 html=get(page).decode();(out/(edition+'.html')).write_text(html,encoding='utf-8');parser=Links();parser.feed(html)
 for i,url in enumerate(dict.fromkeys(parser.links)):
  try:
   file=f'{edition}-{i}.jpg';path=out/file
   if not path.exists():path.write_bytes(get(url))
   im=Image.open(path);records.append({'edition':edition,'file':file,'url':url,'page':page,'size':im.size})
  except Exception as e:print(edition,i,str(e))
extras={f'gow20-product-{i}.jpg':f'https://gmedia.playstation.com/is/image/SIEPDC/DualsenseController-GOW20-{i:02d}-16x9-01-28feb26$en?wid=3840&fmt=png-alpha' for i in [1,2,3,4,5]}
extras['genshin-product-0.jpg']='https://store.sony.co.th/cdn/shop/files/DualSense_LE_GENSHIN_PR_01_RGB.png?v=1765331559'
extras['genshin-front-hi.jpg']='https://cdn.uc.assets.prezly.com/b6887f63-cdd2-47dc-ae10-4eab42fb21a5/DualSense_LE_GENSHIN_PR_01_RGB.jpg'
extras['genshin-rear.jpg']='https://shopatsc.com/cdn/shop/files/5_78af7bd5-650e-4dc5-bb30-ed37cd00e9df.jpg?v=1771228484'
extras['monsterhunter-rear.jpg']='https://p2.bahamut.com.tw/B/2KU/32/73b997f7e5083ed8291bf9ddf31tay85.JPG'
for file,url in extras.items():
 try:
  path=out/file
  if not path.exists():path.write_bytes(get(url))
  im=Image.open(path);records.append({'edition':file.split('-')[0],'file':file,'url':url,'size':im.size})
 except Exception as e:print(file,str(e))
(out/'sources.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
for edition in pages:
 rows=[r for r in records if r['edition']==edition];canvas=Image.new('RGB',(1200,300*((len(rows)+2)//3)),'#888');draw=ImageDraw.Draw(canvas)
 for i,row in enumerate(rows):
  canvas.paste(ImageOps.contain(Image.open(out/row['file']).convert('RGB'),(390,270)),((i%3)*400,(i//3)*300));draw.text(((i%3)*400,(i//3)*300+275),row['file']+' '+str(row['size']),fill='white')
 if rows:canvas.save(root/'artifacts'/f'{edition}-contact.jpg')
 print(edition,len(rows),'reference views')
