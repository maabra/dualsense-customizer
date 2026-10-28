import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(25000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/shader|THREE.WebGLProgram/i.test(m.text()))errors.push(m.text());});
 await page.goto('http://127.0.0.1:4174/');await page.locator('input[value="low"]').check();await page.getByRole('button',{name:'Open studio'}).click();await page.locator('#loading').waitFor({state:'hidden',timeout:90000});
 assert.equal(await page.locator('#parts .part-icon').count(),8);
 await page.getByRole('button',{name:'Editions',exact:true}).click();
 const ids=[['Wolverine · Battle Yellow','wolverine-yellow'],['Wolverine · Adamantium','wolverine-metal'],['Gran Turismo','gt'],['30th Anniversary','anniversary'],['Astro Bot','astro'],['Astro Bot · Joyful','astro-joyful'],['God of War','godofwar'],['Spider','spiderman']];
 for(const [name,id] of ids){
  await page.getByLabel('Search editions').fill(name);await page.locator('.edition-card').first().click();
  assert.match(await page.locator('#selection-info').textContent(),/Hand-drawn artwork recreation/);
  await page.getByRole('button',{name:'Apply edition to all parts'}).click();await page.waitForTimeout(350);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('dualsense-studio-v1')));assert.equal(saved.parts['shell-left'].id,id);
  await page.screenshot({path:`artifacts/art-${id}.png`});
 }
 // Reproduce the requested mixed build, preserving every other part.
 await page.locator('#parts').getByRole('button',{name:'Front shell',exact:true}).click();await page.getByLabel('Search editions').fill('Wolverine · Battle Yellow');await page.locator('.edition-card').click();
 await page.locator('#parts').getByRole('button',{name:'Touchpad',exact:true}).click();await page.getByLabel('Search editions').fill('Gran Turismo');await page.locator('.edition-card').click();
 await page.locator('#parts').getByRole('button',{name:'Face buttons',exact:true}).click();await page.getByLabel('Search editions').fill('30th');await page.locator('.edition-card').click();
 await page.screenshot({path:'artifacts/art-mixed.png'});
 await page.locator('#quality').click();await page.locator('input[value="original"]').check();await page.getByRole('button',{name:'Open studio'}).click();
 await page.locator('#loading').waitFor({state:'hidden',timeout:90000});assert.equal(await page.locator('.model-error').count(),0);
 await page.screenshot({path:'artifacts/art-mixed-original.png'});
 await page.getByLabel('Search editions').fill('Fortnite');await page.locator('.edition-card').click();assert.match(await page.locator('#selection-info').textContent(),/has not been recreated/);
 await page.getByRole('button',{name:/Advanced 25 parts/}).click();assert.equal(await page.locator('#parts .part-icon').count(),25);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(350);await page.locator('#parts').scrollIntoViewIfNeeded();await page.screenshot({path:'artifacts/art-icons-mobile.png'});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 console.log('PASS: generated icons in basic and advanced modes; all eight artwork recreations render; requested mix on Low Definition and Original models; saved choices; unrecreated-edition labels; mobile layout; no shader or JS errors.');
} finally {await browser.close();}
