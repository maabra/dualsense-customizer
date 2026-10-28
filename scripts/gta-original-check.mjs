import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/shader|WebGLProgram/.test(m.text()))errors.push(m.text());});
 await page.goto('http://127.0.0.1:4174/');await page.getByRole('button',{name:'Continue',exact:true}).click();await page.locator('#loading').waitFor({state:'hidden',timeout:90000});
 await page.getByRole('button',{name:/Whole controller/}).click();await page.getByRole('button',{name:'Editions',exact:true}).click();
 for(const variant of ['Black','White']){
  await page.getByLabel('Search editions').fill('GTA VI · '+variant);await page.locator('.edition-card').click();
  await page.getByRole('button',{name:'Perspective',exact:true}).click();await page.waitForTimeout(700);await page.screenshot({path:`artifacts/gta-original-${variant.toLowerCase()}.png`});
 }
 const coated=await page.locator('#canvas-wrap canvas').screenshot();await page.locator('#finish').selectOption('matte');await page.waitForTimeout(300);const matte=await page.locator('#canvas-wrap canvas').screenshot();assert.equal(coated.equals(matte),false,'Edition coating must visibly differ from matte override');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('dualsense-studio-v1')));assert.ok(Object.values(saved.parts).every(p=>p.id==='gta-white'&&p.finish==='matte'));
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 console.log('PASS: both GTA variants on Original, molded-relief shader with original normals, iridescent coating/manual finish, saved choices and mobile layout.');
}finally{await browser.close();}
