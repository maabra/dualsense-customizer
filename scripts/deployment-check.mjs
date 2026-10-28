import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader']});
try {
 const base=process.env.STUDIO_URL || 'http://127.0.0.1:4174/';
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(25000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'networkidle'});await page.getByRole('dialog').waitFor();
 assert(page.url().includes('/docs/'),'Branch root must open the built app');
 assert(await page.locator('input[value="original"]').isChecked());
 for(const level of ['original','high','low']) {
  if(level!=='original')await page.locator('#model-status').click();
  await page.locator(`input[value="${level}"]`).check();await page.getByRole('button',{name:'Open studio'}).click();
  await page.locator('#loading').waitFor({state:'hidden',timeout:90000});
  assert.equal(await page.locator('.model-error').count(),0);
  assert.match(await page.locator('#model-status').textContent(),level==='original'?/Original/:level==='high'?/High Definition/:/Low Definition/);
  await page.screenshot({path:`artifacts/deployed-${level}.png`});
 }
 const blocked=await browser.newPage({viewport:{width:390,height:844}});
 await blocked.route('**/assets/*.js',route=>route.abort());await blocked.goto(base);
 await blocked.getByRole('heading',{name:'Studio unavailable'}).waitFor();
 assert.equal(await blocked.evaluate(()=>getComputedStyle(document.body).backgroundColor),'rgb(16, 19, 17)');
 await blocked.screenshot({path:'artifacts/dark-fallback.png'});
 const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(new URL('docs/',base).href);
 assert((await nojs.content()).includes('JavaScript is disabled.'));
 assert.equal(await nojs.evaluate(()=>getComputedStyle(document.body).backgroundColor),'rgb(16, 19, 17)');
 await page.goto(new URL('docs/404.html',base).href);await page.getByRole('heading',{name:'Page not found'}).waitFor();
 assert.deepEqual(errors,[]);
 const html=await fs.readFile('docs/index.html','utf8');assert(!html.includes('source-build-redirect'));assert(!html.includes('src/main.js'));
 console.log('PASS: branch-root redirect to compiled app; all three real models render; original preferred; blocked bundle and no-JS remain dark; 404; no source references or redirect loop in build.');
} finally {await browser.close();}
