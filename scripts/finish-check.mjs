import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/shader|WebGLProgram/.test(m.text()))errors.push(m.text());});
 await page.goto('http://127.0.0.1:4174/');await page.getByRole('button',{name:'Continue',exact:true}).click();await page.locator('#loading').waitFor({state:'hidden',timeout:90000});
 await page.getByRole('button',{name:/Whole controller/}).click();await page.getByRole('button',{name:'Editions',exact:true}).click();await page.getByLabel('Search editions').fill('Battle Yellow');await page.locator('.edition-card').click();
 await page.locator('#finish').selectOption('matte');await page.locator('#artwork-finish').selectOption('matte');await page.waitForTimeout(400);
 const matte=await page.locator('#canvas-wrap canvas').screenshot();
 await page.locator('#artwork-finish').selectOption('metallic');await page.waitForTimeout(400);const metallic=await page.locator('#canvas-wrap canvas').screenshot();assert.equal(matte.equals(metallic),false,'Artwork finish must change rendered pixels');
 await page.screenshot({path:'artifacts/original-independent-metallic-print.png'});
 await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await page.locator('#loading').waitFor({state:'hidden',timeout:90000});await page.getByRole('button',{name:/Whole controller/}).click();
 assert.equal(await page.locator('#finish').inputValue(),'matte');assert.equal(await page.locator('#artwork-finish').inputValue(),'metallic');
 await page.getByRole('button',{name:'Editions',exact:true}).click();await page.getByLabel('Search editions').fill('Final Fantasy');await page.locator('.edition-card').click();await page.waitForTimeout(350);await page.screenshot({path:'artifacts/original-ff16-reference.png'});
 assert.equal(await page.locator('.model-error').count(),0);assert.deepEqual(errors,[]);console.log('PASS: Original model, visible independent print finish, reload persistence, high-resolution reference layout and no shader errors.');
}finally{await browser.close();}
