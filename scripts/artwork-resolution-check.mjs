import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const mobile=process.env.ARTWORK_MOBILE==='1';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist',`--use-angle=${process.env.ARTWORK_GPU||'d3d11'}`]});
try{
 const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile}),errors=[];
 page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/shader|WebGLProgram|OUT_OF_MEMORY/.test(m.text()))errors.push(m.text());});
 await page.addInitScript(()=>{
  window.textureAllocations=[];
  const original=WebGL2RenderingContext.prototype.texStorage2D;
  WebGL2RenderingContext.prototype.texStorage2D=function(...args){
   window.textureAllocations.push([args[3],args[4]]);return original.apply(this,args);
  };
 });
 await page.goto('http://127.0.0.1:4174/');
 await page.locator('input[value="original"]').check();await page.getByRole('button',{name:'Continue',exact:true}).click();
 await page.locator('#loading').waitFor({state:'hidden'});
 if(mobile)await page.locator('#sheet-toggle').click();
 await page.getByRole('button',{name:/Whole controller/}).click();await page.getByRole('button',{name:'Editions',exact:true}).click();
 for(const edition of ['Gran Turismo','Gray Camouflage']){
  await page.getByLabel('Search editions').fill(edition);await page.locator('.edition-card').first().click();
  await page.getByRole('button',{name:'Front',exact:true}).click();
  if(mobile)await page.locator('#sheet-toggle').click();
  else{
   for(let i=0;i<3;i++)await page.getByRole('button',{name:'Zoom in',exact:true}).click();
   // Pan the left grip/D-pad into the center of the close-up.
   await page.mouse.move(500,430);await page.mouse.down({button:'right'});await page.mouse.move(790,430,{steps:8});await page.mouse.up({button:'right'});
  }
  await page.waitForTimeout(1000);
  await page.locator('#canvas-wrap canvas').screenshot({path:`artifacts/resolution-${mobile?'mobile':'desktop'}-${edition.replaceAll(' ','-')}.png`});
  await page.getByRole('button',{name:'Reset view',exact:true}).click();
  if(mobile)await page.locator('#sheet-toggle').click();
 }
 const sizes=await page.evaluate(()=>window.textureAllocations);
 const width=mobile?4096:8192;
 assert(sizes.some(([w,h])=>w===width&&h>width*.6),`Missing ${width}px native UV render target: ${JSON.stringify(sizes)}`);
 assert.deepEqual(errors,[]);
 console.log(`PASS: ${mobile?'mobile':'desktop'} Original model, ${width}px GPU allocations, GT/Camouflage close-ups, no rendering errors.`);
}finally{await browser.close();}
