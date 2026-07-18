#!/usr/bin/env node
/**
 * Continue rescheduling from post 68 onwards
 */
const { generate } = require('./generate-poster.cjs');
const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const KEY = 'Bearer mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const BID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const startDay = '2026-07-21';
const posterDir = path.join(__dirname, '..', 'tmp', 'posters', 'reschedule');
fs.mkdirSync(posterDir, { recursive: true });

const code = fs.readFileSync(path.join(__dirname, 'social-bulk-schedule.cjs'), 'utf8');
const tw = eval(code.match(/const TWITTER_POSTS = (\[[\s\S]*?\n\]);/)[1]);
const li = eval(code.match(/const LINKEDIN_POSTS = (\[[\s\S]*?\n\]);/)[1]);

function tmpl(t) {
  const l = t.toLowerCase();
  if (/hot take|unpopular|myth/.test(l)) return 'hotTake';
  if (/stop paying|free alternative|tool|terminal.*tool|@/.test(l)) return 'tool';
  if (/tip:|pro tip|hack/.test(l)) return 'tip';
  if (/stage|workflow|process|step/.test(l)) return 'list';
  if (/wisdom|advice|career|lesson/.test(l)) return 'quote';
  return 'humor';
}
function day(s, o) { const d = new Date(s); d.setDate(d.getDate()+o); return d.toISOString().split('T')[0]; }
function api(m, p, b) {
  return new Promise((res, rej) => {
    const data = b ? JSON.stringify(b) : null;
    const req = https.request({ hostname:'api.mymarky.ai', path:'/api'+p, method:m, headers:{'Authorization':KEY,'Content-Type':'application/json',...(data?{'Content-Length':Buffer.byteLength(data)}:{})} }, r => { let body=''; r.on('data',c=>body+=c); r.on('end',()=>{try{res({status:r.statusCode,data:JSON.parse(body)})}catch{res({status:r.statusCode,data:body})}}); });
    req.on('error',rej); if(data) req.write(data); req.end();
  });
}

let stats = { tw: 0, li: 0, err: 0, imgs: 0 };

async function proc(post, type, idx, total, hour) {
  const date = day(startDay, post.day);
  const schedTime = new Date(date + 'T' + String(hour).padStart(2,'0') + ':00:00Z');
  const t = tmpl(post.text);
  process.stdout.write('['+(idx+1)+'/'+total+'] ');
  
  const svg = generate(post.text, t);
  const svgP = path.join(posterDir, type+'-'+String(idx+1).padStart(3,'0')+'.svg');
  const pngP = svgP.replace('.svg','.png');
  fs.writeFileSync(svgP, svg);
  await sharp(fs.readFileSync(svgP)).png().toFile(pngP);
  
  let img = null;
  try { 
    const r = execSync('curl -s --max-time 15 -F "reqtype=fileupload" -F "fileToUpload=@'+pngP+'" https://catbox.moe/user/api.php',{encoding:'utf8'}).trim(); 
    if(r.startsWith('http')){img=r;stats.imgs++;} 
  } catch(e){}
  
  const body = { caption: post.text };
  if (img) body.media_urls = [img];
  
  const cr = await api('POST','/businesses/'+BID+'/posts',body);
  if(!cr.data?.id){console.log('❌ create');stats.err++;return;}
  
  const sr = await api('POST','/businesses/'+BID+'/posts/'+cr.data.id+'/schedule',{scheduled_publish_time:schedTime.toISOString()});
  if(sr.status===200){console.log('✅'+(img?' 📸':''));if(type==='tw')stats.tw++;else stats.li++;}
  else{console.log('❌ schedule');stats.err++;}
  
  await new Promise(r=>setTimeout(r,2500));
}

(async()=>{
  console.log('--- Twitter (from #68) ---');
  for(let i=67;i<tw.length;i++){
    await proc(tw[i],'tw',i,tw.length,[6,10,14][tw[i].slot]);
  }
  console.log('\n--- LinkedIn ---');
  for(let i=0;i<li.length;i++){
    await proc(li[i],'li',i,li.length,7);
  }
  console.log('\n=== DONE ===');
  console.log('Twitter: '+stats.tw+', LinkedIn: '+stats.li+', Images: '+stats.imgs+', Errors: '+stats.err);
})();
