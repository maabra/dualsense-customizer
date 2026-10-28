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
 'gt':('../detail/gallery-1.jpg',900,500,540,'gt'),
 'gt-rear':('../detail/gallery-5.jpg',900,500,540,'gt-rear'),
 'godofwar':('../pass2/godofwar-0.jpg',810,532,487,'godofwar'),
 'spiderman':('../pass2/spiderman-5.jpg',870,452,526,'spiderman'),
 'spiderman-pad':('../pass2/spiderman-5.jpg',870,452,526,'spiderman-pad'),
 'marathon-rear':('../pass2/marathon-angle-3.jpg',800,445,480,'marathon-rear'),
 'yotei-black-rear':('../pass2/yotei-black-angle-3.jpg',800,445,480,'yotei-rear'),
 '007-rear':('../pass2/007-angle-3.jpg',800,445,480,'007-rear'),
 'lisa-rear':('../pass2/lisa-angle-3.jpg',800,445,480,'lisa-rear'),
 'fortnite':('fortnite-7.jpg',962,676,487,'fortnite'),
 'lastofus':('lastofus-0.jpg',1213,483,421,'lastofus'),
 'lastofus-pad':('lastofus-0.jpg',1213,483,421,'lastofus-pad'),
 'helldivers':('helldivers-15.jpg',1282,443,420,'helldivers'),
 'helldivers-pad':('helldivers-15.jpg',1282,443,420,'helldivers-pad'),
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
   if mode.endswith('-pad'):
    corners={'spiderman-pad':[[670,185],[1070,185],[1045,365],[705,365]],'lastofus-pad':[[1050,263],[1383,263],[1358,408],[1090,408]],'helldivers-pad':[[1110,238],[1448,238],[1413,378],[1141,378]]}[mode]
    homography=cv2.getPerspectiveTransform(np.float32(corners),np.float32([[-.405,.642],[.405,.642],[.33,.205],[-.33,.205]]))
    world=cv2.perspectiveTransform(points.astype(np.float32)[None],homography)[0]
   else:
    up,down={'spiderman':(430,650),'lastofus':(341,580),'helldivers':(330,550)}.get(mode,(scale,scale))
    world=np.array([[(float(x)-cx)/scale,(cy-float(y))/(up if y<cy else down)] for x,y in points])
   paths.append([[round(float(x),4),round(float(y),4)] for x,y in world])
  layers.append({'color':color,'paths':paths})
 if mode=='fortnite':
  blue=(hsv[:,:,0]>85)&(hsv[:,:,0]<118)&(hsv[:,:,1]>60)&(hsv[:,:,2]>65)
  blue[:340]=False;blue[:,:450]=False;blue[:,1470:]=False
  blobs,_=cv2.findContours(blue.astype(np.uint8),cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
  region=np.zeros(gray.shape,np.uint8)
  cv2.drawContours(region,[c for c in blobs if cv2.contourArea(c)>5000],-1,1,-1)
  region=cv2.morphologyEx(region,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))>0
  add((gray<100)&region,'#263342')
  add((gray>180)&(hsv[:,:,1]<75)&region,'#e8e8df')
  add((hsv[:,:,0]>18)&(hsv[:,:,0]<39)&(hsv[:,:,1]>100)&(hsv[:,:,2]>100)&region,'#ebd534')
  add((hsv[:,:,0]>4)&(hsv[:,:,0]<=18)&(hsv[:,:,1]>100)&(hsv[:,:,2]>80)&region,'#e59a4c')
  add((hsv[:,:,0]>103)&(hsv[:,:,0]<126)&(hsv[:,:,1]>110)&(hsv[:,:,2]<180)&region,'#2865a5')
 elif mode.startswith('lastofus'):
  region=np.zeros(gray.shape,np.uint8)
  cv2.fillPoly(region,[np.int32([[970,280],[1050,263],[1383,263],[1490,280],[1600,400],[1680,650],[1620,840],[1530,860],[1430,650],[1340,610],[1090,610],[1020,650],[900,860],[815,840],[810,650],[875,400]])],1)
  delta=gray.astype(float)-cv2.GaussianBlur(gray,(0,0),5).astype(float)
  add((delta < -7)&(gray<65)&(region>0),'#17191c')
  add((gray>165)&(hsv[:,:,1]<65)&(region>0),'#dfe2e0')
 elif mode.startswith('helldivers'):
  region=np.zeros(gray.shape,np.uint8)
  cv2.fillPoly(region,[np.int32([[1015,245],[1110,238],[1448,238],[1543,245],[1620,430],[1640,700],[1570,795],[1510,780],[1420,590],[1150,590],[1065,780],[990,795],[935,700],[950,430]])],1)
  yellow=(hsv[:,:,0]>18)&(hsv[:,:,0]<40)&(hsv[:,:,1]>90)&(hsv[:,:,2]>90)
  add(yellow&(region>0),'#cbb12d')
  delta=gray.astype(float)-cv2.GaussianBlur(gray,(0,0),6).astype(float)
  add((gray>85)&(hsv[:,:,1]<65)&(delta>8)&(region>0),'#92999c')
  # Preserve wear cutouts within yellow paint rather than inventing scratches.
  for c in cv2.findContours(yellow.astype(np.uint8),cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)[0]:
   if cv2.contourArea(c)>400:cv2.drawContours(region,[c],-1,2,-1)
  add((gray<75)&(region==2),'#292b2c')
 elif mode.endswith('-rear'):
  region=np.zeros(gray.shape,np.uint8)
  cv2.rectangle(region,(int(cx-scale*.36),int(cy-scale*.58)),(int(cx+scale*.36),int(cy-scale*.29)),1,-1)
  if mode=='marathon-rear':mask=(hsv[:,:,0]>25)&(hsv[:,:,0]<48)&(hsv[:,:,1]>90)&(hsv[:,:,2]>110);ink='#c7ed36'
  elif mode=='yotei-rear':mask=(gray<115);ink='#55544f'
  elif mode=='007-rear':mask=(hsv[:,:,1]<90)&(gray>150);ink='#e0d5b5'
  else:
   delta=gray.astype(float)-cv2.GaussianBlur(gray,(0,0),6).astype(float);mask=(delta>5)&(gray>145);ink='#c3c4c8'
  add(mask&(region>0),ink)
  if mode=='yotei-rear':add((hsv[:,:,0]<12)&(hsv[:,:,1]>70)&(hsv[:,:,2]>55),'#96504a')
 elif mode.startswith('spiderman'):
  region=np.zeros(gray.shape,np.uint8)
  cv2.fillPoly(region,[np.int32([[955,180],[1200,180],[1290,230],[1355,430],[1397,660],[1395,830],[1337,878],[1265,870],[1200,650],[1140,520],[1080,380],[1035,365]])],1)
  red=((hsv[:,:,0]<13)|(hsv[:,:,0]>166))&(hsv[:,:,1]>100)&(hsv[:,:,2]>65)&(region>0)
  add(red,'#b72238')
  if mode=='spiderman-pad':
   region[:]=0;cv2.rectangle(region,(700,195),(1030,360),1,-1)
   add((gray>160)&(hsv[:,:,1]<65)&(region>0),'#e7e8e5')
 elif mode=='godofwar':
  add((hsv[:,:,0]>100)&(hsv[:,:,0]<132)&(hsv[:,:,1]>65)&(hsv[:,:,2]>45),'#35447c')
 elif mode=='gt':
  add(gray<115,'#25292b')
  add((hsv[:,:,0]<12)&(hsv[:,:,1]>100)&(hsv[:,:,2]>90),'#b92f43')
  add((hsv[:,:,0]>95)&(hsv[:,:,0]<125)&(hsv[:,:,1]>95)&(hsv[:,:,2]>80),'#3678b7')
 elif mode.startswith('gta'):
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
