"""Extract flat-color reference contours; never bake photographed shading into a map.
Only inspected, nearly orthographic front views are eligible. Shapes are an
approximation: supplied geometry differs from the photographed production unit.
"""
import cv2,json,numpy as np
from pathlib import Path
root=Path(__file__).resolve().parents[1];folder=root/'assets/references/catalog'
jobs={
 'ff16':('ff16-7.jpg',500,493,400,'dark'),
 'marathon':('marathon-front.jpg',800,445,480,'light'),
 'lisa':('lisa-front.jpg',800,446,480,'light'),
 '007':('007-front.jpg',800,445,480,'gold'),
 'deathstranding':('deathstranding-front.jpg',800,443,480,'orange'),
 'yotei-black':('yotei-black-front.jpg',800,446,480,'light'),
 'camo':('camo-front.jpg',800,445,480,'camo'),
 'gta-black':('../detail/gallery-16.jpg',900,500,540,'gta-black'),
 'gta-white':('../detail/gallery-21.jpg',900,500,540,'gta-white'),
}
result={}
for key,(filename,cx,cy,scale,mode) in jobs.items():
 im=cv2.imread(str(folder/filename));hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV);gray=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY)
 layers=[]
 def add(mask,color):
  contours,_=cv2.findContours(mask.astype(np.uint8)*255,cv2.RETR_LIST,cv2.CHAIN_APPROX_SIMPLE)
  paths=[]
  for c in contours:
   if cv2.contourArea(c)<2:continue
   points=cv2.approxPolyDP(c,.6,True)[:,0]
   paths.append([[round((float(x)-cx)/scale,4),round((cy-float(y))/scale,4)] for x,y in points])
  layers.append({'color':color,'paths':paths})
 if mode.startswith('gta'):
  delta=cv2.GaussianBlur(gray,(0,0),7).astype(float)-gray.astype(float)
  if mode=='gta-black':add((delta < -6)&(gray>45),'#4b5558')
  else:add((delta>8)&(gray<220),'#b7b9bb')
 elif mode=='dark':
  add((hsv[:,:,0]>10)&(hsv[:,:,0]<43)&(hsv[:,:,1]>25)&(hsv[:,:,2]>55),'#a19478')
  add((hsv[:,:,0]>86)&(hsv[:,:,0]<125)&(hsv[:,:,1]>60)&(hsv[:,:,2]>50),'#316990')
 elif mode=='orange':
  orange=(hsv[:,:,0]>7)&(hsv[:,:,0]<40)&(hsv[:,:,1]>100)&(hsv[:,:,2]>80)
  add(orange,'#ed9f4b')
  # Preserve lettering and insignia inside orange pad print, including holes.
  region=np.zeros(gray.shape,np.uint8);cv2.rectangle(region,(int(cx-scale*.38),int(cy-scale*.60)),(int(cx+scale*.38),int(cy-scale*.24)),1,-1)
  add((gray<70)&(region>0),'#24262b')
 elif mode=='gold':
  delta=cv2.GaussianBlur(gray,(0,0),7).astype(float)-gray.astype(float)
  add((delta>11)&(gray<170),'#806b40')
 elif mode=='camo':
  for lo,hi,color in [(0,53,'#35343a'),(53,80,'#4d4c54'),(80,105,'#62626a'),(105,140,'#77777c')]:add((gray>=lo)&(gray<hi),color)
 else:
  add(gray<105,'#24262a')
  if key=='marathon':add((hsv[:,:,0]>26)&(hsv[:,:,0]<48)&(hsv[:,:,1]>105)&(hsv[:,:,2]>95),'#b6ec24')
  if key=='lisa':add((hsv[:,:,0]>80)&(hsv[:,:,0]<112)&(hsv[:,:,1]>70)&(hsv[:,:,2]>80),'#69c8e2')
 # Remove silhouettes outside the controller's modeled front extent; geometry
 # clips the remaining control holes naturally. Even-odd fill retains counters.
 result[key]=layers
(root/'src/catalog-traces.json').write_text(json.dumps(result,separators=(',',':')),encoding='utf-8')
print('Extracted',len(result),'reference layouts')
