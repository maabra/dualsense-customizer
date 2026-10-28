import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {VectorCanvas} from './vector-canvas.mjs';

// Load the actual drawing modules with an SVG context in place of the DOM
// canvas. This preserves one authoring implementation for app and SVG masters.
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const moduleBody=source=>source.replace(/^import[^\n]*\n/gm,'').replaceAll('export ','');
const traces=JSON.parse(await read('src/catalog-traces.json'));
const referenceTraces=JSON.parse(await read('src/reference-traces.json'));
const catalog=new Function('traces',moduleBody(await read('src/catalog-artwork.js'))+';return {additionalEditions,catalogPartColor,drawCatalogArtwork,drawTracedArtwork};')(traces);
const names=['referenceTraces',...Object.keys(catalog),'document'];
const values=[referenceTraces,...Object.values(catalog),{createElement:()=>new VectorCanvas()}];
const drawing=new Function(...names,moduleBody(await read('src/edition-artwork.js'))+';return {createEditionCanvas,recreatedEditions};')(...values);
const groups=[['shell','shell-left'],['rear','rear-left'],['trim','trim-left'],['touchpad','touchpad'],['ps','ps'],
 ...['triangle','circle','cross','square'].map(p=>['buttons','button-'+p]),...['up','right','down','left'].map(p=>['dpad','dpad-'+p])];
const directory=new URL('../public/artwork-vectors/',import.meta.url);await mkdir(directory,{recursive:true});
const manifest={description:'Resolution-independent artwork masters. Artwork is approximate, not factory-authenticated. Same drawing code as the app; native UV placement is defined by the shared model UV charts.',rights:'../RIGHTS.md',editions:{}};
for(const id of drawing.recreatedEditions){
 await mkdir(new URL(id+'/',directory),{recursive:true});const files={};
 for(const [group,part] of groups){
  const canvas=drawing.createEditionCanvas(id,part,group,'high');if(!canvas)continue;
  let svg=canvas.toSVG();
  if(id==='gt'&&group==='trim')svg='<svg xmlns="http://www.w3.org/2000/svg" width="4096" height="2661" viewBox="0 0 4096 2661"><defs><pattern id="weave" width="48" height="24" patternUnits="userSpaceOnUse"><rect width="48" height="24" fill="#171a1e"/><path fill="#32363b" d="M0 0h22v10H0zM24 12h22v10H24z"/><path fill="#202429" d="M24 0h22v10H24zM0 12h22v10H0z"/><path fill="#40454b" d="M1 1h20v1H1zM25 13h20v1H25z"/><path fill="#2b3036" d="M25 1h20v1H25zM1 13h20v1H1z"/></pattern></defs><rect width="4096" height="2661" fill="url(#weave)"/></svg>';
  const name=['buttons','dpad'].includes(group)?part:group;await writeFile(new URL(id+'/'+name+'.svg',directory),svg);files[name]=id+'/'+name+'.svg';
 }
 manifest.editions[id]=files;
}
await writeFile(new URL('manifest.json',directory),JSON.stringify(manifest,null,2));
console.log(`Exported SVG masters for ${Object.keys(manifest.editions).length} editions.`);
