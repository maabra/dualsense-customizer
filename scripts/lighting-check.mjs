import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { transferProgress } from '../src/loading.js';
assert.equal(transferProgress(106,100),99);
assert.equal(transferProgress(0,100),0);
assert.equal(transferProgress(30,100,70),70);
assert.equal(transferProgress(20,0),null);
assert.equal(transferProgress(Infinity,100),null);
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(25000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4174/');await page.locator('input[value="low"]').check();await page.getByRole('button',{name:'Continue'}).click();
 await page.locator('#loading').waitFor({state:'hidden',timeout:90000});
 await page.screenshot({path:'artifacts/ps-studio-desktop.png'});
 await page.getByRole('tab',{name:'Light bar',exact:true}).click();
 const presets=[['Player 2','#ff334f'],['Player 1','#0072ff'],['Player 3','#32d16d'],['Player 4','#ed69bb'],['White','#ffffff']];
 const pictures=[];
 for(const [name,color] of presets) {
  const button=page.locator('.player-colors').getByRole('button',{name,exact:true});await button.scrollIntoViewIfNeeded();await button.click();
  await page.waitForTimeout(150);assert.equal(await page.locator('#light-color').inputValue(),color);
  assert.equal(await button.getAttribute('aria-pressed'),'true');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('dualsense-studio-v1')));assert.equal(saved.light,color);
  pictures.push(await page.locator('canvas').screenshot());
 }
 for(let i=1;i<pictures.length;i++)assert(!pictures[0].equals(pictures[i]),'Light presets must change the rendered controller');
 await page.locator('#light-color').fill('#ff9900');await page.locator('#light-color').dispatchEvent('input');
 await page.waitForTimeout(150);assert.equal(await page.locator('.player-colors button[aria-pressed="true"]').count(),0);
 await page.screenshot({path:'artifacts/ps-custom-light.png'});
 await page.setViewportSize({width:390,height:844});await page.getByRole('tab',{name:'Light bar',exact:true}).click();
 const blue=page.locator('.player-colors').getByRole('button',{name:'Player 1',exact:true});await blue.scrollIntoViewIfNeeded();await blue.click();
 await page.screenshot({path:'artifacts/ps-studio-mobile.png'});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 console.log('PASS: progress overflow/monotonic/unknown-size cases; five preset lights visibly change the model; custom picker; saved light state; mobile controls; no JS errors.');
} finally {await browser.close();}
