import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/shader|WebGLProgram/.test(m.text()))errors.push(m.text());});
 await page.goto('http://127.0.0.1:4174/');await page.locator('input[value="low"]').check();await page.getByRole('button',{name:'Continue',exact:true}).click();await page.locator('#loading').waitFor({state:'hidden',timeout:90000});
 await page.getByRole('button',{name:/Whole controller/}).click();await page.getByRole('button',{name:'Editions',exact:true}).click();
 for(const [search,id] of (process.env.DETAIL_REAR_ONLY?[]:[['Ragnar','godofwar'],['Spider','spiderman'],['Gran Turismo','gt'],['Fortnite','fortnite'],['Last of Us','lastofus'],['Helldivers','helldivers']])){
  await page.getByLabel('Search editions').fill(search);await page.locator('.edition-card').click();await page.getByRole('button',{name:'Front',exact:true}).click();await page.waitForTimeout(700);await page.screenshot({path:`artifacts/detail-${id}.png`});
 }
 for(const [search,id] of [['Marathon','marathon'],['Yōtei · Black','yotei-black'],['007','007'],['LISA','lisa']]){
  await page.getByLabel('Search editions').fill(search);await page.locator('.edition-card').click();await page.getByRole('button',{name:'Rear',exact:true}).click();await page.waitForTimeout(700);await page.screenshot({path:`artifacts/detail-${id}-rear.png`});
  if(id==='marathon'){
   const green=await page.locator('#canvas-wrap canvas').evaluate(canvas=>{const copy=document.createElement('canvas');copy.width=canvas.width;copy.height=canvas.height;const ctx=copy.getContext('2d');ctx.drawImage(canvas,0,0);const data=ctx.getImageData(0,0,copy.width,copy.height).data;let count=0;for(let i=0;i<data.length;i+=4)if(data[i+1]>100&&data[i+1]>data[i]*1.04&&data[i+1]>data[i+2]*1.2)count++;return count;});
   assert.ok(green>20,'Lime rear logo must actually appear in rendered pixels');
  }
 }
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'All parts',exact:true}).click();await page.getByRole('button',{name:/Whole controller/}).click();await page.screenshot({path:'artifacts/detail-mobile.png'});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);console.log('PASS: reference-based front and rear layouts, finish data shaders and mobile layout without JS or shader errors.');
}finally{await browser.close();}
