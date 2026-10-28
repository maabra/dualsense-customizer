import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader']});
try {
 const page=await browser.newPage();
 const models=[];page.on('request',r=>{if(r.url().endsWith('.glb'))models.push(r.url());});
 await page.route('**/dualsense-original.glb',route=>route.fulfill({status:404,body:'not found'}));
 await page.goto('http://127.0.0.1:4174/');
 await page.getByRole('button',{name:'Continue'}).click();
 await page.getByRole('alert').waitFor();assert.match(await page.getByRole('alert').textContent(),/404/);
 await page.getByRole('button',{name:'Choose another model'}).click();
 await page.locator('input[value="low"]').check();await page.getByRole('button',{name:'Continue'}).click();
 await page.locator('#loading').waitFor({state:'hidden',timeout:90000});
 assert.equal(await page.locator('.model-error').count(),0);
 assert.match(await page.locator('#model-status').textContent(),/Low Definition/);
 assert(models.every(url=>url.includes('/docs/models/')));
 console.log('PASS: explicit 404 message; choose another model without reload; Low Definition renders; URLs resolve relative to compiled module.');
} finally {await browser.close();}
