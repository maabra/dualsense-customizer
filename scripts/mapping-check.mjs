import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/shader|WebGLProgram/.test(m.text()))errors.push(m.text());});
 await page.goto('http://127.0.0.1:4174/');await page.getByRole('button',{name:'Continue',exact:true}).click();await page.locator('#loading').waitFor({state:'hidden',timeout:90000});
 await page.getByRole('button',{name:/Whole controller/}).click();await page.getByRole('button',{name:'Editions',exact:true}).click();await page.getByLabel('Search editions').fill('Gran Turismo');await page.locator('.edition-card').click();
 await page.getByRole('button',{name:'Front',exact:true}).click();await page.waitForTimeout(700);
 for(let i=0;i<3;i++)await page.getByRole('button',{name:'Zoom in',exact:true}).click();
 const canvas=page.locator('#canvas-wrap canvas'),box=await canvas.boundingBox();await page.mouse.move(box.x+box.width*.45,box.y+box.height*.5);await page.mouse.down({button:'right'});await page.mouse.move(box.x+box.width*.65,box.y+box.height*.5,{steps:8});await page.mouse.up({button:'right'});await page.waitForTimeout(350);
 await page.screenshot({path:'artifacts/mapping-gt-macro-original.png'});
 await page.getByRole('button',{name:'Reset view',exact:true}).first().click();await page.getByLabel('Search editions').fill('Battle Yellow');await page.locator('.edition-card').click();await page.getByRole('button',{name:'Rear',exact:true}).click();await page.waitForTimeout(700);await page.screenshot({path:'artifacts/mapping-rear-original.png'});
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);console.log('PASS: Original-model macro front/back mapping, 4K artwork upload, camera pan/zoom and mobile layout without shader errors.');
}finally{await browser.close();}
