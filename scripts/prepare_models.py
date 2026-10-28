"""Split supplied meshes by connected surface; retain original UVs and textures."""
import collections, copy, json, pathlib, struct

ROOT = pathlib.Path(__file__).resolve().parent.parent

def prepare(filename, output):
    with open(ROOT / 'assets' / filename, 'rb') as f:
        f.read(12)
        n, _ = struct.unpack('<II', f.read(8))
        doc = json.loads(f.read(n))
        n, _ = struct.unpack('<II', f.read(8))
        binary = bytearray(f.read(n))

    def read(index):
        a = doc['accessors'][index]; v = doc['bufferViews'][a['bufferView']]
        width = {'SCALAR': 1, 'VEC3': 3}[a['type']]
        fmt = {5126: 'f', 5125: 'I', 5123: 'H'}[a['componentType']]
        start = v.get('byteOffset', 0) + a.get('byteOffset', 0)
        return list(struct.iter_unpack('<' + fmt * width, binary[start:start + a['count'] * width * struct.calcsize(fmt)]))

    materials = {}
    for mesh in doc['meshes']:
        primitive = mesh['primitives'][0]
        mat = primitive['material']
        positions = read(primitive['attributes']['POSITION'])
        indices = [x[0] for x in read(primitive['indices'])]
        parents = list(range(len(positions)))
        def root(i):
            while parents[i] != i:
                parents[i] = parents[parents[i]]; i = parents[i]
            return i
        def union(a, b):
            parents[root(a)] = root(b)
        same = {}
        for i, p in enumerate(positions):
            key = tuple(round(x, 5) for x in p)
            if key in same: union(i, same[key])
            same[key] = i
        for i in range(0, len(indices), 3):
            union(indices[i], indices[i+1]); union(indices[i], indices[i+2])
        components = collections.defaultdict(list)
        for i in range(len(positions)): components[root(i)].append(i)
        parts = {}
        for r, ids in components.items():
            lo = [min(positions[i][a] for i in ids) for a in range(3)]
            hi = [max(positions[i][a] for i in ids) for a in range(3)]
            x, y, z = [(lo[a]+hi[a])/2 for a in range(3)]
            if mat == 2: part = 'rear'
            elif mat == 0:
                if lo[0] < -.9 and hi[0] > .9: part = 'trim'
                elif abs(x) > .5: part = 'shell'
                elif lo[1] > .2 and hi[0] > .39: part = 'touchpad'
                elif lo[1] > .17: part = 'light'
                else: part = 'trim'
            elif abs(x) > .4 and z > .2 and y < .5:
                part = 'buttons' if x > 0 else 'dpad'
            elif abs(x) > .4 and y > .4: part = 'triggers'
            elif .17 < abs(x) < .46 and y < .15: part = 'sticks'
            else: part = 'details'
            parts[r] = part
        grouped = collections.defaultdict(list)
        for i in range(0, len(indices), 3):
            r = root(indices[i]); part = parts[r]
            # Transparent button caps must be separate draw calls from their symbols.
            group = (part, r if part in ('buttons', 'dpad') else 0)
            grouped[group].extend(indices[i:i+3])
        mesh['primitives'] = []
        for (part, _), values in grouped.items():
            key = (mat, part)
            if key not in materials:
                material = copy.deepcopy(doc['materials'][mat]); material['name'] = part
                materials[key] = len(doc['materials']); doc['materials'].append(material)
            while len(binary) % 4: binary.append(0)
            start = len(binary); binary.extend(struct.pack('<' + 'I'*len(values), *values))
            view = len(doc['bufferViews']); doc['bufferViews'].append({'buffer':0,'byteOffset':start,'byteLength':len(values)*4,'target':34963})
            accessor = len(doc['accessors']); doc['accessors'].append({'bufferView':view,'componentType':5125,'count':len(values),'type':'SCALAR'})
            p = copy.deepcopy(primitive); p['indices'] = accessor; p['material'] = materials[key]
            mesh['primitives'].append(p)
    # Work directly in the original modeling coordinates: front faces +Z.
    for node in doc['nodes']: node.pop('matrix', None)
    doc['buffers'][0]['byteLength'] = len(binary)
    data = json.dumps(doc, separators=(',', ':')).encode()
    data += b' ' * (-len(data) % 4); binary += b'\0' * (-len(binary) % 4)
    path = ROOT / 'public/models' / output
    with open(path, 'wb') as f:
        f.write(struct.pack('<III', 0x46546c67, 2, 28+len(data)+len(binary)))
        f.write(struct.pack('<II',len(data),0x4e4f534a)); f.write(data)
        f.write(struct.pack('<II',len(binary),0x004e4942)); f.write(binary)
    print(f'{output}: {len(materials)} part materials, {path.stat().st_size:,} bytes')

prepare('playstation_5_dualsense_low.glb', 'dualsense-low.glb')
prepare('playstation_5_dualsense.glb', 'dualsense-high.glb')
