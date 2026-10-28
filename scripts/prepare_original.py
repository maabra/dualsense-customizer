"""Convert the provided original Collada and texture files into a web-ready GLB.

Requires Pillow. Geometry is retained without subdivision or simplification.
Texture operations only pack material channels and convert image orientation.
"""
import io, json, struct, zipfile, xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image
from prepare_models import prepare

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'assets/original/source/model'
archive = None if (SOURCE/'model.dae').exists() else zipfile.ZipFile(SOURCE.parent/'model.zip')
def source_bytes(name):
    return archive.read('model/'+name) if archive else (SOURCE/name).read_bytes()
def source_exists(name):
    return ('model/'+name in archive.namelist()) if archive else (SOURCE/name).exists()
root = ET.fromstring(source_bytes('model.dae'))
ns = {'c': root.tag.split('}')[0][1:]}
doc = {'asset': {'version': '2.0', 'generator': 'DualSense Studio original Collada converter',
                 'extras': {'author': 'AHarmlessPotato', 'license': 'CC-BY-4.0', 'source': 'assets/original/source/model/model.dae'}},
       'scene': 0, 'scenes': [{'nodes': [0, 1, 2]}], 'nodes': [], 'meshes': [], 'materials': [],
       'accessors': [], 'bufferViews': [], 'buffers': [], 'images': [], 'textures': []}
binary = bytearray()
def view(data, target=None):
    binary.extend(b'\0' * (-len(binary) % 4))
    result = {'buffer': 0, 'byteOffset': len(binary), 'byteLength': len(data)}
    if target: result['target'] = target
    binary.extend(data); doc['bufferViews'].append(result)
    return len(doc['bufferViews']) - 1
def accessor(values, width, integer=False):
    data = struct.pack('<' + ('I' if integer else 'f') * len(values), *values)
    result = {'bufferView': view(data, 34963 if integer else 34962), 'componentType': 5125 if integer else 5126,
              'count': len(values)//width, 'type': {1:'SCALAR',2:'VEC2',3:'VEC3'}[width]}
    if not integer:
        result['min'] = [min(values[i::width]) for i in range(width)]
        result['max'] = [max(values[i::width]) for i in range(width)]
    doc['accessors'].append(result); return len(doc['accessors']) - 1
def image_texture(image):
    image = image.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    data = io.BytesIO(); image.save(data, format='PNG')
    doc['images'].append({'bufferView': view(data.getvalue()), 'mimeType': 'image/png'})
    doc['textures'].append({'source': len(doc['images'])-1})
    return {'index': len(doc['textures'])-1}
def load_map(material, name):
    extension = 'png' if name == 'normal' else 'jpg'
    return Image.open(io.BytesIO(source_bytes(f'textures/{material}_{name}.{extension}')))

for i, (geometry, material_id) in enumerate(zip(root.findall('.//c:geometry',ns), ['1011','1001','1002'])):
    arrays = {s.get('id'): list(map(float,s.find('c:float_array',ns).text.split())) for s in geometry.findall('c:mesh/c:source',ns)}
    prefix = geometry.get('id')
    positions, normals, uv = [arrays[prefix+suffix] for suffix in ['-positions','-normals','-tex0']]
    polygons = geometry.find('c:mesh/c:polylist',ns)
    counts = list(map(int,polygons.find('c:vcount',ns).text.split()))
    assert all(n == 3 for n in counts), 'Source geometry must be triangulated'
    assert all(x.get('offset') == '0' for x in polygons.findall('c:input',ns)), 'Expected shared indices'
    indices = list(map(int,polygons.find('c:p',ns).text.split()))
    attrs = {'POSITION':accessor(positions,3),'NORMAL':accessor(normals,3),'TEXCOORD_0':accessor(uv,2)}
    doc['meshes'].append({'name':material_id,'primitives':[{'attributes':attrs,'indices':accessor(indices,1,True),'material':i}]})
    doc['nodes'].append({'mesh':i,'name':f'Original {material_id}'})
    albedo = load_map(material_id,'albedo').convert('RGBA')
    has_opacity = source_exists(f'textures/{material_id}_opacity.jpg')
    if has_opacity: albedo.putalpha(load_map(material_id,'opacity').convert('L'))
    roughness = load_map(material_id,'roughness').convert('L')
    metallic = load_map(material_id,'metallic').convert('L')
    packed = Image.merge('RGB',(Image.new('L',roughness.size,255),roughness,metallic))
    material = {'name':material_id,'doubleSided':True,'pbrMetallicRoughness':{
        'baseColorTexture':image_texture(albedo),'metallicRoughnessTexture':image_texture(packed)},
        'normalTexture':image_texture(load_map(material_id,'normal').convert('RGB'))}
    if has_opacity: material['alphaMode']='BLEND'
    if material_id=='1011': material.update({'emissiveFactor':[1,1,1],'emissiveTexture':image_texture(load_map(material_id,'emissive').convert('RGB'))})
    doc['materials'].append(material)

doc['buffers']=[{'byteLength':len(binary)}]
data=json.dumps(doc,separators=(',',':')).encode();data+=b' '*(-len(data)%4);binary+=b'\0'*(-len(binary)%4)
output=ROOT/'artifacts/original-source.glb';output.parent.mkdir(exist_ok=True)
with output.open('wb') as f:
    f.write(struct.pack('<III',0x46546c67,2,28+len(data)+len(binary)))
    f.write(struct.pack('<II',len(data),0x4e4f534a));f.write(data)
    f.write(struct.pack('<II',len(binary),0x004e4942));f.write(binary)
prepare(output,'dualsense-original.glb')
