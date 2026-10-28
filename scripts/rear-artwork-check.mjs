import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader']});
try {
 const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/shader|WebGLProgram/.test(m.text()))errors.push(m.text());});
 await page.goto('http://127.0.0.1:4174/');
 await page.locator('input[value="low"]').check();await page.getByRole('button',{name:'Continue',exact:true}).click();
 await page.locator('#loading').waitFor({state:'hidden',timeout:90000});
 await page.locator('#parts').getByRole('button',{name:'Front shell',exact:true}).click();
 await page.getByRole('button',{name:'Editions',exact:true}).click();
 await page.getByLabel('Search editions').fill('Battle Yellow');await page.locator('.edition-card').click();
 await page.getByRole('button',{name:'Apply to entire controller'}).click();
 await page.getByRole('button',{name:'Rear',exact:true}).click();await page.waitForTimeout(1000);
 await page.screenshot({path:'artifacts/detailed-rear.png'});
 await page.getByRole('tab',{name:'Settings',exact:true}).click();
 assert.equal(await page.getByRole('link',{name:'Rights and testing notice ↗'}).getAttribute('href'),'./RIGHTS.md');
 const response=await page.request.get('http://127.0.0.1:4174/docs/RIGHTS.md');assert.equal(response.status(),200);assert.match(await response.text(),/CC BY 4.0/);
 assert.deepEqual(errors,[]);console.log('PASS: rear edition rendering, no shader errors, public rights notice and preserved attribution.');
}finally{await browser.close();}
