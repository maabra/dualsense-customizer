import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[];
 page.setDefaultTimeout(30000);page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/shader|WebGLProgram/.test(m.text()))errors.push(m.text());});
 await page.goto('http://127.0.0.1:4174/');await page.locator('input[value="low"]').check();
 await page.getByRole('button',{name:'Continue',exact:true}).click();await page.locator('#loading').waitFor({state:'hidden',timeout:120000});
 assert.equal(await page.locator('#stage .intro').count(),0);
 const handle=page.locator('#sheet-toggle'),panel=page.locator('#panel');
 const initial=await panel.boundingBox();assert(initial.height<=102,'Closed drawer leaves the preview visible');
 let h=await handle.boundingBox();await page.mouse.move(h.x+h.width/2,h.y+h.height/2);await page.mouse.down();
 await page.mouse.move(h.x+h.width/2,h.y+h.height/2-80,{steps:8});
 const during=await panel.boundingBox();assert(during.y<initial.y-40,'Drawer follows the drag before release');
 await page.mouse.move(h.x+h.width/2,h.y-430,{steps:12});await page.mouse.up();await page.waitForTimeout(400);
 assert.equal(await handle.getAttribute('aria-expanded'),'true');
 const opened=await panel.boundingBox();assert(opened.height>initial.height*3);
 const preview=await page.locator('#stage').boundingBox();assert(Math.abs(preview.y+preview.height-opened.y)<3,'Preview tracks drawer boundary');
 await page.getByRole('button',{name:/Whole controller/}).click();await page.getByRole('button',{name:'Editions',exact:true}).click();
 assert.equal(await page.locator('.edition-card').count(),28);
 await page.screenshot({path:'artifacts/mobile-drawer-open.png'});
 h=await handle.boundingBox();const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:h.x+h.width/2,y:h.y+h.height/2}]});
 for(let i=1;i<=12;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:h.x+h.width/2,y:h.y+h.height/2+(initial.y-h.y+20)*i/12}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(400);
 assert.equal(await handle.getAttribute('aria-expanded'),'false');
 await page.screenshot({path:'artifacts/mobile-drawer-closed.png'});
 // A tap remains an accessible alternative to dragging.
 await page.waitForTimeout(400);await handle.tap();await page.waitForTimeout(350);assert.equal(await handle.getAttribute('aria-expanded'),'true');
 await page.locator('.panel-scroll').evaluate(el=>el.scrollTop=80);
 assert((await page.locator('.panel-scroll').evaluate(el=>el.scrollTop))>0,'Artwork library remains scrollable');
 await page.locator('.panel-scroll').evaluate(el=>el.scrollTop=0);
 await page.evaluate(()=>{
  window.drawerTouchTrace=[];
  for(const type of ['touchstart','touchmove','touchend'])document.getElementById('panel').addEventListener(type,event=>window.drawerTouchTrace.push({type,target:event.target.tagName,cancelable:event.cancelable,prevented:event.defaultPrevented,scroll:document.querySelector('.panel-scroll').scrollTop,top:document.getElementById('panel').getBoundingClientRect().top}));
 });
 const heading=await page.locator('.selected-part-heading h3').boundingBox();
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:heading.x+heading.width/2,y:heading.y+heading.height/2}]});
 for(let i=1;i<=12;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:heading.x+heading.width/2,y:heading.y+heading.height/2+320*i/12}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(400);
 assert.equal(await handle.getAttribute('aria-expanded'),'false','Pulling the menu down from the top of its content closes it: '+JSON.stringify(await page.evaluate(()=>window.drawerTouchTrace)));
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.setViewportSize({width:1440,height:1000});await page.waitForTimeout(400);
 assert(!(await handle.isVisible()));assert((await panel.boundingBox()).width>300);
 assert.deepEqual(errors,[]);console.log('PASS: live drawer drag, snap open/closed, preview resizing, touch tap, content scrolling, 28 editions, desktop resize and no shader errors.');
}finally{await browser.close();}
