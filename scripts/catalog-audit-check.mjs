import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.setDefaultTimeout(30000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/shader|WebGLProgram/.test(m.text()))errors.push(m.text());});
 await page.goto('http://127.0.0.1:4174/');await page.locator(`input[value="${process.env.AUDIT_MODEL||'low'}"]`).check();await page.getByRole('button',{name:'Continue',exact:true}).click();await page.locator('#loading').waitFor({state:'hidden',timeout:180000});
 await page.getByRole('button',{name:/Whole controller/}).click();await page.getByRole('button',{name:'Editions',exact:true}).click();
 const allNames=await page.locator('.edition-card b').allTextContents();assert.equal(allNames.length,28);
 const names=process.env.AUDIT_FILTER?allNames.filter(name=>new RegExp(process.env.AUDIT_FILTER,'i').test(name)):allNames;
 for(const name of names){
  await page.getByLabel('Search editions').fill(name);await page.locator('.edition-card').filter({has:page.getByText(name,{exact:true})}).click();
  await page.getByRole('button',{name:'Front',exact:true}).click();await page.waitForTimeout(650);
  const id=await page.evaluate(()=>JSON.parse(localStorage.getItem('dualsense-studio-v1')).parts['shell-left'].id);
  await page.locator('#canvas-wrap canvas').screenshot({path:`artifacts/audit-${id}-front.png`});
  if(id.startsWith('gta')||['godofwar','concord','yotei-gold','genshin','monsterhunter','gow20','iconblue','lastofus'].includes(id)){
   await page.getByRole('button',{name:'Perspective',exact:true}).click();await page.waitForTimeout(700);await page.locator('#canvas-wrap canvas').screenshot({path:`artifacts/audit-${id}-angle.png`});
   await page.getByRole('button',{name:'Rear',exact:true}).click();await page.waitForTimeout(700);await page.locator('#canvas-wrap canvas').screenshot({path:`artifacts/audit-${id}-rear.png`});
  }
 }
 assert.deepEqual(errors,[]);console.log(`PASS: ${names.length} edition front captures; selected rear/oblique views; no shader or JS errors.`);
}finally{await browser.close();}
