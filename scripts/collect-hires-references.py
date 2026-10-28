"""Collect larger source renders for the detailed artwork pass, not AI upscales."""
import concurrent.futures,json,re,urllib.request
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1];out=root/'assets/references/hires';out.mkdir(parents=True,exist_ok=True)
source=json.loads((root/'assets/references/catalog/sources.json').read_text(encoding='utf-8'))
jobs={}
for row in source['images']:
 if row['file'] in ['marathon-front.jpg','lisa-front.jpg','deathstranding-front.jpg','yotei-black-front.jpg','camo-front.jpg']:
  jobs[row['file']]=re.sub(r'\?wid=\d+','?wid=3840',row['url'])+'&fmt=png-alpha'
jobs.update({
 'lebron-front.jpg':'https://m.media-amazon.com/images/I/719B-o3q7PL._SL1500_.jpg',
 'helldivers-front.jpg':'https://cdn.comfy.ua/media/catalog/product/d/s/dswc_le_hd2_rndr_lt_prod_rgb_eas_241202_1_.jpg',
 'astro-joyful-front.jpg':'https://resources.budgetgaming.nl/boxarts/134189_kopen_1200x846.jpg',
})
def collect(item):
 name,url=item
 try:
  path=out/name
  if not path.exists():path.write_bytes(urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=40).read())
  im=Image.open(path);return {'file':name,'url':url,'width':im.width,'height':im.height}
 except Exception as e:return {'file':name,'url':url,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:rows=list(pool.map(collect,jobs.items()))
(out/'sources.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')
for row in rows:print(row['file'],row.get('width'),row.get('height'),row.get('error',''))
