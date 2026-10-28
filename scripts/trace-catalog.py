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
 'gta-relief':('../detail/gallery-21.jpg',900,500,540,'gta-relief'),
 'gta-rear-logo':('../detail/gallery-25.jpg',900,500,540,'gta-rear-logo'),
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
 'hogwarts':('../audit/hogwarts-front.jpg',951,564,692,'hogwarts'),
 'concord':('../audit/concord-front-alt.jpg',837,298,321,'concord'),
 'concord-pad':('../audit/concord-front-alt.jpg',837,298,321,'concord-pad'),
 'concord-rear':('../audit/concord-rear.jpg',354,190,300,'concord-rear'),
 'godofwar-rear':('../audit/godofwar-rear.jpg',350,365,230,'godofwar-rear'),
 'lebron':('../audit/lebron-front.jpg',290,287,264,'lebron'),
 'lebron-pad':('../audit/lebron-front.jpg',290,287,264,'lebron-pad'),
 'yotei-gold':('../audit/yotei-gold-front.jpg',500,386,488,'yotei-gold'),
 'yotei-gold-rear':('../audit/yotei-gold-rear.jpg',800,785,640,'yotei-gold-rear'),
}
result={}
jobs['lebron']=('../hires/lebron-front.jpg',750,493,450,'lebron')
jobs['lebron-pad']=jobs['lebron'][:-1]+('lebron-pad',)
for key,(filename,cx,cy,scale,mode) in jobs.items():
 # These manufacturer renders have identical framing at 2.4x the original
 # resolution. Scale calibration as well as the image; never enlarge old paths.
 high=root/'assets/references/hires'/Path(filename).name
 if key in ['marathon','lisa','deathstranding','yotei-black','camo'] and high.exists():
  filename=str(high);cx*=2.4;cy*=2.4;scale*=2.4
 raw=cv2.imread(str(folder/filename),cv2.IMREAD_UNCHANGED);im=raw[:,:,:3];source_alpha=raw[:,:,3]>200 if raw.shape[2]==4 else np.ones(raw.shape[:2],dtype=bool)
 if key in ['helldivers','helldivers-pad']:
  # Register the clean product render to the established plate landmarks.
  # The older promotional shot obscured the hatching and tiny control labels.
  clean=cv2.imread(str(root/'assets/references/hires/helldivers-front.jpg'))
  if clean is not None:
   yy,xx=np.indices(im.shape[:2],dtype=np.float32)
   mx=(xx-1282)*(900/420)+951
   my=(yy-443)*np.where(yy<443,840/330,923/550)+720
   im=cv2.remap(clean,mx.astype(np.float32),my.astype(np.float32),cv2.INTER_CUBIC,borderMode=cv2.BORDER_CONSTANT,borderValue=(255,255,255))
 hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV);gray=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY)
 layers=[]
 def add(mask,color,maximum=None):
  contours,_=cv2.findContours(mask.astype(np.uint8)*255,cv2.RETR_LIST,cv2.CHAIN_APPROX_SIMPLE)
  paths=[]
  for c in contours:
   if mode=='camo' and cv2.contourArea(c)<12:continue
   # Retain tiny letter counters, brush scratches and hatch marks. A long
   # hairline may have almost no area and still be a meaningful printed detail.
   if cv2.contourArea(c)<.5 and cv2.arcLength(c,True)<4:continue
   if maximum is not None and cv2.contourArea(c)>maximum:continue
   points=cv2.approxPolyDP(c,.6 if mode=='camo' else .3,True)[:,0]
   if mode.endswith('-pad'):
    corners={'spiderman-pad':[[670,185],[1070,185],[1045,365],[705,365]],'lastofus-pad':[[1050,263],[1383,263],[1358,408],[1090,408]],'helldivers-pad':[[1110,238],[1448,238],[1413,378],[1141,378]],'concord-pad':[[713,132],[960,132],[929,242],[744,242]],'lebron-pad':[[184,122],[395,121],[378,237],[203,237]]}[mode]
    if mode=='lebron-pad':corners=[[568,212],[930,212],[898,401],[603,401]]
    homography=cv2.getPerspectiveTransform(np.float32(corners),np.float32([[-.405,.642],[.405,.642],[.33,.205],[-.33,.205]]))
    world=cv2.perspectiveTransform(points.astype(np.float32)[None],homography)[0]
   else:
    up,down={'spiderman':(430,650),'lastofus':(341,580),'helldivers':(330,550),'concord':(290,430),'lebron':(447,457),'yotei-gold':(488,510)}.get(mode,(scale,scale))
    world=np.array([[(float(x)-cx)/scale,(cy-float(y))/(up if y<cy else down)] for x,y in points])
   paths.append([[round(float(x),5),round(float(y),5)] for x,y in world])
  layers.append({'color':color,'paths':paths})
 if mode=='hogwarts':
  add((hsv[:,:,0]>12)&(hsv[:,:,0]<45)&(hsv[:,:,1]>40)&(hsv[:,:,2]>70),'#baa05c')
 elif mode.startswith('concord') and not mode.endswith('rear'):
  add(((hsv[:,:,0]<16)|(hsv[:,:,0]>170))&(hsv[:,:,1]>85)&(hsv[:,:,2]>60),'#bb4239')
  region=np.zeros(gray.shape,np.uint8);cv2.fillPoly(region,[np.int32([[565,130],[1050,130],[1130,330],[1120,560],[1020,590],[950,405],[720,405],[640,590],[540,560],[535,330]])],1)
  add((hsv[:,:,0]>74)&(hsv[:,:,0]<105)&(hsv[:,:,1]>80)&(hsv[:,:,2]>60)&(region>0),'#58a69d')
 elif mode.startswith('lebron'):
  mask=(hsv[:,:,2]<95)&source_alpha
  blobs,_=cv2.findContours(mask.astype(np.uint8),cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE);region=np.zeros(gray.shape,np.uint8)
  cv2.drawContours(region,[c for c in blobs if cv2.contourArea(c)>10000],-1,1,-1)
  for lo,hi,color in [(18,43,'#e0cf40'),(140,179,'#d55da8'),(88,130,'#38b6d5'),(45,87,'#45af88')]:add((hsv[:,:,0]>=lo)&(hsv[:,:,0]<=hi)&(hsv[:,:,1]>75)&(hsv[:,:,2]>100)&(region>0),color)
  add((gray>160)&(hsv[:,:,1]<60)&(region>0),'#e9ebe5')
 elif mode=='yotei-gold':
  add((hsv[:,:,0]>12)&(hsv[:,:,0]<43)&(hsv[:,:,1]>45)&(hsv[:,:,2]>85)&source_alpha,'#b49a52')
  add((gray<160)&(gray>60)&(hsv[:,:,1]<55)&source_alpha,'#8e9288',maximum=2000)
 elif mode=='fortnite':
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
  if mode=='concord-rear':
   add((((hsv[:,:,0]<16)|(hsv[:,:,0]>168))&(hsv[:,:,1]>90)&(gray>50)&(region>0)),'#bb4239')
   mask=(gray>145)&(hsv[:,:,1]<60);ink='#e3e7e6'
  elif mode=='godofwar-rear':
   region[:]=0;cv2.rectangle(region,(260,260),(442,323),1,-1)
   mask=(gray>80)&(hsv[:,:,1]<155);ink='#a9b0bd'
  elif mode=='marathon-rear':mask=(hsv[:,:,0]>25)&(hsv[:,:,0]<48)&(hsv[:,:,1]>90)&(hsv[:,:,2]>110);ink='#c7ed36'
  elif mode=='yotei-gold-rear':
   add((hsv[:,:,0]>12)&(hsv[:,:,0]<43)&(hsv[:,:,1]>45)&(hsv[:,:,2]>85)&(region>0),'#b49a52')
   mask=(gray<175)&(hsv[:,:,1]<60);ink='#777b76'
  elif mode=='yotei-rear':mask=(gray<115);ink='#55544f'
  elif mode=='007-rear':mask=(hsv[:,:,1]<90)&(gray>150);ink='#e0d5b5'
  else:
   delta=gray.astype(float)-cv2.GaussianBlur(gray,(0,0),6).astype(float);mask=(delta>5)&(gray>145);ink='#c3c4c8'
  add(mask&(region>0),ink)
  if mode in ['yotei-rear','yotei-gold-rear']:add((hsv[:,:,0]<12)&(hsv[:,:,1]>70)&(hsv[:,:,2]>55),'#96504a')
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
 elif mode=='gta-rear-logo':
  delta=cv2.GaussianBlur(gray,(0,0),12).astype(float)-gray.astype(float)
  region=np.zeros(gray.shape,np.uint8);cv2.rectangle(region,(810,200),(995,365),1,-1)
  add((delta>1.8)&(gray>100)&(hsv[:,:,1]<40)&(region>0),'#555555')
 elif mode=='gta-relief':
  delta=cv2.GaussianBlur(gray,(0,0),14).astype(float)-gray.astype(float)
  region=np.zeros(gray.shape,np.uint8)
  cv2.rectangle(region,(790,205),(1015,365),1,-1)
  for x0,x1 in [(365,650),(1150,1435)]:cv2.rectangle(region,(x0,200),(x1,805),1,-1)
  add((delta>2.2)&(hsv[:,:,1]<40)&(gray>100)&(region>0),'#555555')
  centers=[[-.623,.39],[-.723,.276],[-.524,.276],[-.623,.167],[.623,.423],[.77,.276],[.476,.276],[.623,.129],[-.467,.55],[.467,.55]]
  for layer in layers:
   clean=[]
   for path in layer['paths']:
    p=np.asarray(path);lo=p.min(0);hi=p.max(0);span=hi-lo;mid=(lo+hi)/2
    hardware=(span<.25).all() and (span>.065).all() and any((abs(mid-np.asarray(c))<.035).all() for c in centers)
    if not hardware:clean.append(path)
   layer['paths']=clean
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
  # Separate the four printed patches from JPEG grain and photographed plastic
  # stippling; those surface details belong to the model's normal map.
  gray=cv2.bilateralFilter(gray,7,24,5)
  for lo,hi,color in [(0,53,'#35343a'),(53,80,'#4d4c54'),(80,105,'#62626a'),(105,140,'#77777c')]:add((gray>=lo)&(gray<hi),color)
 else:
  add(gray<105,'#24262a')
  if key=='marathon':add((hsv[:,:,0]>26)&(hsv[:,:,0]<48)&(hsv[:,:,1]>105)&(hsv[:,:,2]>95),'#b6ec24')
  if key=='lisa':add((hsv[:,:,0]>80)&(hsv[:,:,0]<112)&(hsv[:,:,1]>70)&(hsv[:,:,2]>80),'#69c8e2')
 # Remove silhouettes outside the controller's modeled front extent; geometry
 # clips the remaining control holes naturally. Even-odd fill retains counters.
 result[key]=layers
# Small rear product photographs lose the thin subtitle. Use the official
# high-resolution logo's silhouette, fitted to the photographed rear placement.
logo_path=root/'assets/references/audit/godofwar-logo.png'
if logo_path.exists():
 logo=cv2.imread(str(logo_path),cv2.IMREAD_UNCHANGED);mask=np.uint8(logo[:,:,3]>180)*255
 ys,xs=np.where(mask>0);x0,x1=xs.min(),xs.max();y0,y1=ys.min(),ys.max();scale=.5/(x1-x0)
 paths=[]
 for contour in cv2.findContours(mask,cv2.RETR_LIST,cv2.CHAIN_APPROX_SIMPLE)[0]:
  if cv2.contourArea(contour)<4:continue
  points=cv2.approxPolyDP(contour,.4,True)[:,0]
  paths.append([[round((float(x)-(x0+x1)/2)*scale,5),round(.39-(float(y)-(y0+y1)/2)*scale,5)] for x,y in points])
 result['godofwar-rear']=[{'color':'#a9b0bd','paths':paths}]
# Astro's blue grip panels are molded regions, not generic side stripes.
astro=cv2.imread(str(root/'assets/references/hires/astro-joyful-front.jpg'))
if astro is not None:
 hsv=cv2.cvtColor(astro,cv2.COLOR_BGR2HSV);yy,xx=np.indices(hsv.shape[:2])
 mask=np.uint8((hsv[:,:,0]>100)&(hsv[:,:,0]<125)&(hsv[:,:,1]>120)&((xx<220)|(xx>980))&(yy>195))*255
 # A specular streak is lighting, not a white slit in the molded blue panel.
 mask=cv2.morphologyEx(mask,cv2.MORPH_CLOSE,np.ones((19,19),np.uint8))
 paths=[]
 for c in cv2.findContours(mask,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)[0]:
  if cv2.contourArea(c)<3000:continue
  points=cv2.approxPolyDP(c,.2,True)[:,0]
  paths.append([[round((float(x)-600)/600,5),round((383-float(y))/(590 if y<383 else 600),5)] for x,y in points])
 for edition in ['astro','astro-joyful']:result[edition]=[{'color':'#1260cf','paths':paths}]
(root/'src/catalog-traces.json').write_text(json.dumps(result,separators=(',',':')),encoding='utf-8')
print('Extracted',len(result),'reference layouts')
