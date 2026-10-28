export const parts = [
  ['shell', 'Front shell', '◒'], ['touchpad', 'Touchpad', '▱'],
  ['buttons', 'Face buttons', '◈'], ['dpad', 'D-pad', '✚'],
  ['trim', 'Center trim', '⋁'], ['rear', 'Rear shell', '◓'],
  ['sticks', 'Thumbsticks', '⊙'], ['triggers', 'Triggers', '⌁'],
];
const color = (id, name, hex, finish = 'matte') => ({ id, name, hex, finish, type: 'standard' });
const edition = (id, name, hex, accent = '#202126', finish = 'satin') => ({ id, name, hex, accent, finish, type: 'edition', texture: null });
export const catalog = [
  color('white', 'Classic White', '#e5e7e7'), color('black', 'Midnight Black', '#24252a'),
  color('cosmic', 'Cosmic Red', '#9c274b'), color('blue', 'Starlight Blue', '#62b9df'),
  color('purple', 'Galactic Purple', '#6552ad'), color('pink', 'Nova Pink', '#e84e99'),
  color('cobalt', 'Cobalt Blue', '#2546ac', 'metallic'), color('volcanic', 'Volcanic Red', '#ad343d', 'metallic'),
  color('silver', 'Sterling Silver', '#a7abad', 'metallic'), color('indigo', 'Chroma Indigo', '#6464af', 'metallic'),
  color('pearl', 'Chroma Pearl', '#e8d9d5', 'metallic'), color('teal', 'Chroma Teal', '#529c8b', 'metallic'),
  color('techno', 'Techno Red', '#d51d32', 'gloss'), color('remix', 'Remix Green', '#93d149', 'gloss'),
  color('rhythm', 'Rhythm Blue', '#316fe9', 'gloss'),
  edition('anniversary', '30th Anniversary', '#a5a5a0', '#626361'),
  edition('gt', 'Gran Turismo', '#e3e4e0', '#27292d'),
  edition('wolverine-yellow', 'Wolverine · Battle Yellow', '#dcae26', '#26364e'),
  edition('wolverine-metal', 'Wolverine · Adamantium', '#969da3', '#292e34', 'metallic'),
  edition('astro', 'Astro Bot', '#dfe8ef', '#1875d6', 'gloss'),
  edition('astro-joyful', 'Astro Bot · Joyful', '#e3edf4', '#1b70d5', 'gloss'),
  edition('spiderman', 'Marvel’s Spider-Man 2', '#b42832', '#202126'),
  edition('godofwar', 'God of War Ragnarök', '#c7cdd2', '#344d69'),
  edition('ff16', 'Final Fantasy XVI', '#272b35', '#a8a49b'),
  edition('hogwarts', 'Hogwarts Legacy', '#29252b', '#a88a4b'),
  edition('lebron', 'LeBron James', '#26252c', '#d6ae38'),
  edition('concord', 'Concord', '#922e3c', '#cbb698'),
  edition('fortnite', 'Fortnite', '#368dd5', '#e1d930'),
  edition('helldivers', 'Helldivers 2', '#33363b', '#d4be3c'),
  edition('lastofus', 'The Last of Us', '#434843', '#c5bda4'),
  edition('deathstranding', 'Death Stranding 2', '#23272a', '#c27730'),
  edition('yotei-gold', 'Ghost of Yōtei · Gold', '#b49c61', '#292b29', 'metallic'),
  edition('yotei-black', 'Ghost of Yōtei · Black', '#30322f', '#999992'),
  edition('marathon', 'Marathon', '#e4e7dc', '#b8d750'),
  edition('007', '007 First Light', '#c4ab74', '#262528', 'metallic'),
  edition('gta-black', 'GTA VI · Black', '#272530', '#b778ac'),
  edition('gta-white', 'GTA VI · White', '#e7ded6', '#d1a09f'),
  edition('lisa', 'LISA', '#e3d9e1', '#9c7ea3'),
  edition('camo', 'Gray Camouflage', '#777c76', '#393d38'),
];
export const byId = Object.fromEntries(catalog.map(x => [x.id, x]));
export const defaults = () => Object.fromEntries(parts.map(([key]) => [key, { id: ['trim', 'sticks', 'triggers'].includes(key) ? 'black' : 'white', finish: 'original' }]));
export function paletteColor(entry, part) {
  return entry.type === 'edition' && ['trim', 'sticks', 'triggers', 'dpad', 'buttons'].includes(part) ? entry.accent : entry.hex;
}
