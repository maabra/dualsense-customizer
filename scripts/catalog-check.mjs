import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader']});
try {
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
 page.setDefaultTimeout(30000);page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/shader|WebGLProgram/.test(m.text()))errors.push(m.text());});
 const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('dualsense-studio-v1')));
 await page.goto('http://127.0.0.1:4174/');await page.locator('input[value="low"]').check();await page.getByRole('button',{name:'Continue',exact:true}).click();await page.locator('#loading').waitFor({state:'hidden',timeout:90000});
 await page.getByRole('button',{name:/Whole controller/}).click();
 await page.getByRole('button',{name:'Cosmic Red',exact:true}).click();assert.ok(Object.values((await saved()).parts).every(p=>p.id==='cosmic'));
 await page.getByRole('button',{name:'Personalize',exact:true}).click();await page.locator('.custom-control input').fill('#456789');assert.ok(Object.values((await saved()).parts).every(p=>p.id==='custom'&&p.hex==='#456789'));
 await page.getByRole('button',{name:'Editions',exact:true}).click();assert.equal(await page.locator('.edition-card').count(),28);
 const names=await page.locator('.edition-card b').allTextContents();
 for(const name of names){await page.getByLabel('Search editions').fill(name);await page.locator('.edition-card').filter({has:page.getByText(name,{exact:true})}).click();await page.waitForTimeout(100);const choices=Object.values((await saved()).parts);assert.ok(choices.every(p=>p.id===choices[0].id));assert.match(await page.locator('#selection-info').textContent(),/approximation/);}
 for(const name of ['Final Fantasy','Marathon','LISA','GTA VI · White','Gray Camouflage']){
  await page.getByLabel('Search editions').fill(name);await page.locator('.edition-card').first().click();await page.waitForTimeout(250);await page.screenshot({path:`artifacts/catalog-${name.replace(/\W/g,'')}.png`});
 }
 await page.getByLabel('Search editions').fill('Battle Yellow');await page.locator('.edition-card').click();
 await page.locator('#artwork-finish').selectOption('metallic');assert.ok(Object.values((await saved()).parts).every(p=>p.printFinish==='metallic'));
 await page.locator('#finish').selectOption('matte');assert.ok(Object.values((await saved()).parts).every(p=>p.finish==='matte'&&p.printFinish==='metallic'));
 await page.locator('#artwork-finish').selectOption('original');
 await page.screenshot({path:'artifacts/wolverine-metallic-scratches.png'});
 await page.getByRole('button',{name:'All parts',exact:true}).click();await page.locator('#parts').getByRole('button',{name:'Touchpad',exact:true}).click();await page.getByLabel('Search editions').fill('Gran Turismo');await page.locator('.edition-card').click();
 const mixed=(await saved()).parts;assert.equal(mixed.touchpad.id,'gt');assert.equal(mixed['shell-left'].id,'wolverine-yellow');
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'All parts',exact:true}).click();await page.getByRole('button',{name:/Whole controller/}).click();await page.screenshot({path:'artifacts/whole-controller-mobile.png'});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 console.log('PASS: all 28 edition previews render, whole-controller colors/custom colors/editions, independent artwork finishes, per-part mixing and mobile layout; no JS or shader errors.');
}finally{await browser.close();}
