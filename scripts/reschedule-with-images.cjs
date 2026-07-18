#!/usr/bin/env node
/**
 * Reschedule all social posts with poster images.
 * Generates SVG posters → PNG → catbox.moe → MyMarky with media_urls
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { generate } = require('./generate-poster.cjs');

const KEY = 'Bearer mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const BID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';

// Import post data from bulk scheduler
const TWITTER_POSTS = require('./social-bulk-schedule.cjs').TWITTER_POSTS || [];
const LINKEDIN_POSTS = require('./social-bulk-schedule.cjs').LINKEDIN_POSTS || [];

// Fallback if module.exports not available
function getPosts() {
  try {
    // Try to read the exported arrays
    const code = fs.readFileSync(path.join(__dirname, 'social-bulk-schedule.cjs'), 'utf8');
    
    // Extract TWITTER_POSTS
    const twMatch = code.match(/const TWITTER_POSTS = (\[[\s\S]*?\n\]);/);
    const liMatch = code.match(/const LINKEDIN_POSTS = (\[[\s\S]*?\n\]);/);
    
    const tw = twMatch ? eval(twMatch[1]) : [];
    const li = liMatch ? eval(liMatch[1]) : [];
    
    return { twitter: tw, linkedin: li };
  } catch (e) {
    console.error('Failed to load posts:', e.message);
    return { twitter: [], linkedin: [] };
  }
}

// ── Template mapping ──
function getTemplate(text) {
  const lower = text.toLowerCase();
  if (/hot take|unpopular|myth/.test(lower)) return 'hotTake';
  if (/stop paying|free alternative|tool|terminal.*tool|@/.test(lower)) return 'tool';
  if (/tip:|pro tip|hack|how to|guide/.test(lower)) return 'tip';
  if (/stage|workflow|process|step/.test(lower)) return 'list';
  if (/wisdom|advice|career|lesson|progression/.test(lower)) return 'quote';
  if (/news|update|release|launch/.test(lower)) return 'news';
  return 'humor';
}

// ── Upload to catbox.moe ──
function uploadToCatbox(filePath) {
  return new Promise((resolve, reject) => {
    const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
    const fileData = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    
    const body = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="reqtype"`,
      '',
      'fileupload',
      `--${boundary}`,
      `Content-Disposition: form-data; name="fileToUpload"; filename="${fileName}"`,
      'Content-Type: image/png',
      '',
      fileData.toString('binary'),
      `--${boundary}--`,
    ].join('\r\n');
    
    const req = https.request({
      hostname: 'catbox.moe',
      path: '/user/api.php',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(body, 'binary'),
      },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data.trim()));
    });
    req.on('error', reject);
    req.write(body, 'binary');
    req.end();
  });
}

// ── MyMarky API ──
function apiCall(method, apiPath, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.mymarky.ai',
      path: '/api' + apiPath,
      method,
      headers: {
        'Authorization': KEY,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function getDateForDay(startDay, dayOffset) {
  const d = new Date(startDay);
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().split('T')[0];
}

// ── Main ──
async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const startIdx = args.indexOf('--start');
  const startDay = startIdx >= 0 ? args[startIdx + 1] : '2026-07-21';
  const posterDir = path.join(__dirname, '..', 'tmp', 'posters', 'reschedule');
  fs.mkdirSync(posterDir, { recursive: true });

  const { twitter, linkedin } = getPosts();
  console.log(`Loaded: ${twitter.length} Twitter, ${linkedin.length} LinkedIn posts`);
  console.log(`Start: ${startDay}, Mode: ${dry ? 'DRY' : 'LIVE'}\n`);

  const stats = { twitter: 0, linkedin: 0, errors: 0, imagesUploaded: 0 };
  const catboxCache = {}; // text hash → URL

  // Process Twitter posts
  console.log('=== Twitter Posts ===\n');
  for (let i = 0; i < twitter.length; i++) {
    const post = twitter[i];
    const date = getDateForDay(startDay, post.day);
    const hour = [6, 10, 14][post.slot]; // 9 AM, 1 PM, 5 PM Saudi
    const schedTime = new Date(`${date}T${String(hour).padStart(2, '0')}:00:00Z`);
    const template = getTemplate(post.text);

    console.log(`[${i + 1}/${twitter.length}] Day ${post.day + 1} | ${date} ${hour}:00 UTC | ${template}`);

    if (dry) { stats.twitter++; continue; }

    // Generate poster
    const svg = generate(post.text, template);
    const svgPath = path.join(posterDir, `tw-${String(i + 1).padStart(3, '0')}.svg`);
    const pngPath = svgPath.replace('.svg', '.png');
    fs.writeFileSync(svgPath, svg);

    // Convert to PNG
    const sharp = require('sharp');
    await sharp(fs.readFileSync(svgPath)).png().toFile(pngPath);

    // Upload to catbox
    const hash = post.text.slice(0, 30);
    let imageUrl = catboxCache[hash];
    if (!imageUrl) {
      try {
        imageUrl = await uploadToCatbox(pngPath);
        catboxCache[hash] = imageUrl;
        stats.imagesUploaded++;
        console.log(`  📸 ${imageUrl}`);
      } catch (e) {
        console.log(`  ⚠️ Upload failed: ${e.message}`);
      }
    }

    // Create post
    const body = { caption: post.text };
    if (imageUrl && imageUrl.startsWith('http')) body.media_urls = [imageUrl];

    const createRes = await apiCall('POST', `/businesses/${BID}/posts`, body);
    if (!createRes.data?.id) {
      console.log(`  ❌ Create: ${JSON.stringify(createRes.data).slice(0, 100)}`);
      stats.errors++;
      continue;
    }

    // Schedule
    const schedRes = await apiCall('POST', `/businesses/${BID}/posts/${createRes.data.id}/schedule`, {
      scheduled_publish_time: schedTime.toISOString(),
    });

    if (schedRes.status === 200) {
      console.log(`  ✅ Scheduled`);
      stats.twitter++;
    } else {
      console.log(`  ❌ Schedule: ${JSON.stringify(schedRes.data).slice(0, 100)}`);
      stats.errors++;
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  // Process LinkedIn posts
  console.log('\n=== LinkedIn Posts ===\n');
  for (let i = 0; i < linkedin.length; i++) {
    const post = linkedin[i];
    const date = getDateForDay(startDay, post.day);
    const hour = 7; // 10 AM Saudi
    const schedTime = new Date(`${date}T${String(hour).padStart(2, '0')}:00:00Z`);
    const template = getTemplate(post.text);

    console.log(`[${i + 1}/${linkedin.length}] Day ${post.day + 1} | ${date} ${hour}:00 UTC | ${template}`);

    if (dry) { stats.linkedin++; continue; }

    // Generate poster
    const svg = generate(post.text, template);
    const svgPath = path.join(posterDir, `li-${String(i + 1).padStart(3, '0')}.svg`);
    const pngPath = svgPath.replace('.svg', '.png');
    fs.writeFileSync(svgPath, svg);

    const sharp = require('sharp');
    await sharp(fs.readFileSync(svgPath)).png().toFile(pngPath);

    // Upload to catbox
    const hash = post.text.slice(0, 30);
    let imageUrl = catboxCache[hash];
    if (!imageUrl) {
      try {
        imageUrl = await uploadToCatbox(pngPath);
        catboxCache[hash] = imageUrl;
        stats.imagesUploaded++;
        console.log(`  📸 ${imageUrl}`);
      } catch (e) {
        console.log(`  ⚠️ Upload failed: ${e.message}`);
      }
    }

    const body = { caption: post.text };
    if (imageUrl && imageUrl.startsWith('http')) body.media_urls = [imageUrl];

    const createRes = await apiCall('POST', `/businesses/${BID}/posts`, body);
    if (!createRes.data?.id) {
      console.log(`  ❌ Create: ${JSON.stringify(createRes.data).slice(0, 100)}`);
      stats.errors++;
      continue;
    }

    const schedRes = await apiCall('POST', `/businesses/${BID}/posts/${createRes.data.id}/schedule`, {
      scheduled_publish_time: schedTime.toISOString(),
    });

    if (schedRes.status === 200) {
      console.log(`  ✅ Scheduled`);
      stats.linkedin++;
    } else {
      console.log(`  ❌ Schedule: ${JSON.stringify(schedRes.data).slice(0, 100)}`);
      stats.errors++;
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n=== Summary ===`);
  console.log(`Twitter: ${stats.twitter} posts`);
  console.log(`LinkedIn: ${stats.linkedin} posts`);
  console.log(`Images uploaded: ${stats.imagesUploaded}`);
  console.log(`Errors: ${stats.errors}`);
  console.log(`Total: ${stats.twitter + stats.linkedin} posts`);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
