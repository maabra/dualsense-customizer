"""Register photographed shell contours to the actual shared model landmarks.

Uses a smooth thin-plate spline, including control perimeters, rather than
painting masks around mismatched hardware. Pad registration stays independent.
"""
import json, struct
from pathlib import Path
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]

def model_controls():
    with (ROOT/'public/models/dualsense-original.glb').open('rb') as f:
        f.read(12)
        size, _ = struct.unpack('<II', f.read(8)); doc = json.loads(f.read(size))
        size, _ = struct.unpack('<II', f.read(8)); data = f.read(size)
    def read(index):
        a = doc['accessors'][index]; v = doc['bufferViews'][a['bufferView']]
        width = 3 if a['type']=='VEC3' else 1
        dtype = {5126:np.float32,5125:np.uint32,5123:np.uint16}[a['componentType']]
        return np.frombuffer(data,dtype=dtype,count=a['count']*width,
            offset=v.get('byteOffset',0)+a.get('byteOffset',0)).reshape(-1,width)
    controls = {}
    for mesh in doc['meshes']:
        for p in mesh['primitives']:
            name = doc['materials'][p['material']]['name']
            if not name.startswith(('dpad-','button-')) and name not in ['create','options']: continue
            points = read(p['attributes']['POSITION'])[read(p['indices']).ravel(),:2]
            controls.setdefault(name,[]).extend(points)
    return {name:cv2.convexHull(np.float32(points))[:,0] for name,points in controls.items()}

def ray_edge(contour, center, angle):
    direction = np.array([np.cos(angle),np.sin(angle)])
    hits=[]
    for a,b in zip(contour,np.roll(contour,-1,axis=0)):
        matrix=np.column_stack((direction,a-b))
        if abs(np.linalg.det(matrix))<1e-10: continue
        t,u=np.linalg.solve(matrix,a-center)
        if t>0 and 0<=u<=1: hits.append(t)
    if not hits: raise ValueError('Control outline does not enclose its center')
    return center+direction*max(hits)

def kernel(a,b):
    r2=((a[:,None]-b[None,:])**2).sum(axis=2)
    return .5*r2*np.log(np.maximum(r2,1e-20))

def register(image, controls):
    height,width=image.shape[:2]; scale=width*.3; cx=width/2; cy=width*445/1600
    gray=cv2.cvtColor(image,cv2.COLOR_BGR2GRAY)
    contours=cv2.findContours(np.uint8(gray<40)*255,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)[0]
    candidates=[]
    for c in contours:
        if not .001*scale**2<cv2.contourArea(c)<.05*scale**2:continue
        p=c[:,0].astype(float);p[:,0]=(p[:,0]-cx)/scale;p[:,1]=(cy-p[:,1])/scale
        candidates.append(p)
    source=[];target=[]
    for name,outline in controls.items():
        center=(outline.min(0)+outline.max(0))/2
        photo=min(candidates,key=lambda p:np.linalg.norm((p.min(0)+p.max(0))/2-center))
        photo_center=(photo.min(0)+photo.max(0))/2
        if np.linalg.norm(photo_center-center)>.06: raise ValueError(f'Unmatched {name}')
        for angle in np.linspace(0,2*np.pi,24,endpoint=False):
            # The dark insert boundary excludes the photographed outer bevel.
            # Register that outer edge to the mesh silhouette, rather than
            # leaving a second printed rim surrounding the real control.
            edge=ray_edge(photo,photo_center,angle)
            # D-pad tips nearly meet: expanding their inward-facing edges
            # would cross neighboring landmarks and fold the registration.
            margin=.012
            if name.startswith('dpad-'):
                margin*=np.clip((np.linalg.norm(edge-[-.623,.276])-.06)/.08,0,1)
            source.append(edge+margin*np.array([np.cos(angle),np.sin(angle)]))
            target.append(ray_edge(outline,center,angle))
    # Lock the surrounding panels, keeping registration local to each control
    # cluster without clipping or excluding any artwork.
    for side in [-1,1]:
        for angle in np.linspace(0,2*np.pi,32,endpoint=False):
            p=np.array([side*.623,.276])+[.34*np.cos(angle),.36*np.sin(angle)]
            source.append(p);target.append(p)
    for p in [[-1,-.65],[1,-.65],[-1,.65],[1,.65],[0,0],[0,.65],[0,-.65]]:
        source.append(p);target.append(p)
    source=np.array(source);target=np.array(target)
    affine=np.column_stack((np.ones(len(source)),source))
    matrix=np.block([[kernel(source,source),affine],[affine.T,np.zeros((3,3))]])
    weights=np.linalg.solve(matrix,np.vstack((target-source,np.zeros((3,2)))))
    def transform(points):
        p=np.array(points)
        return p+kernel(p,source)@weights[:-3]+np.column_stack((np.ones(len(p)),p))@weights[-3:]
    error=np.max(np.linalg.norm(transform(source)-target,axis=1))
    assert error<1e-7, error
    x,y=np.meshgrid(np.linspace(-1,1,100),np.linspace(-.65,.65,80))
    grid=np.stack((x.ravel(),y.ravel()),axis=1);mapped=transform(grid)
    dx=(transform(grid+[1e-5,0])-mapped)/1e-5
    dy=(transform(grid+[0,1e-5])-mapped)/1e-5
    determinant=dx[:,0]*dy[:,1]-dx[:,1]*dy[:,0]
    assert determinant.min()>.05, 'Registration folds or collapses the artwork'
    print(f'Registered {len(source)} landmarks; max residual {error:.2g}')
    return {'landmarks':source.tolist(),'weights':weights.tolist()}

if __name__=='__main__':
    path=ROOT/'src/catalog-traces.json';data=json.loads(path.read_text(encoding='utf-8'))
    controls=model_controls()
    # These two official straight-on photographs share the same camera framing.
    for edition,filename in [('camo','camo-front.jpg'),('gt','gt-front.png')]:
        image=cv2.imread(str(ROOT/'assets/references/hires'/filename))
        data[edition+'-shell']={'source':edition,**register(image,controls)}
    path.write_text(json.dumps(data,separators=(',',':')),encoding='utf-8')
