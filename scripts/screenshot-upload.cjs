#!/usr/bin/env node
/**
 * Screenshot Capture + Upload Pipeline
 * 
 * Takes a screenshot of a GitHub repo or website, uploads to catbox.moe.
 * Returns a public URL usable in MyMarky posts.
 * 
 * Usage:
 *   node scripts/screenshot-upload.cjs https://github.com/user/repo
 *   node scripts/screenshot-upload.cjs https://example.com
 *   node scripts/screenshot-upload.cjs --repo user/repo
 * 
 * Returns: { url: "https://files.catbox.moe/xxx.png", path: "local path" }
 * 
 * Requires: browser tools (runs in Hermes agent context)
 * This script outputs instructions for the agent to execute.
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'tmp', 'screenshots');

// ── Upload to catbox.moe ──
function uploadToCatbox(filePath) {
  return new Promise((resolve, reject) => {
    const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
    const fileName = path.basename(filePath);
    const fileData = fs.readFileSync(filePath);
    
    const parts = [];
    parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="reqtype"\r\n\r\nfileupload`);
    parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="fileToUpload"; filename="${fileName}"\r\nContent-Type: image/png\r\n\r\n`);
    
    const header = Buffer.from(parts.join('\r\n'));
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([header, fileData, footer]);
    
    const opts = {
      hostname: 'catbox.moe',
      path: '/user/api.php',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    };
    
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (data.startsWith('https://')) {
          resolve(data.trim());
        } else {
          reject(new Error(`Upload failed: ${data.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Extract images from GitHub README ──
async function findReadmeImages(repo) {
  const url = `https://raw.githubusercontent.com/${repo}/main/README.md`;
  const fallback = `https://raw.githubusercontent.com/${repo}/master/README.md`;
  
  for (const readmeUrl of [url, fallback]) {
    try {
      const content = await new Promise((resolve, reject) => {
        https.get(readmeUrl, (res) => {
          let data = '';
          res.on('data', c => data += c);
          res.on('end', () => resolve(data));
        }).on('error', reject);
      });
      
      // Find image URLs
      const images = [];
      const imgRegex = /(?:src="|!\[.*?\]\()([^")\s]+\.(png|gif|webp|jpg|jpeg))/gi;
      let match;
      while ((match = imgRegex.exec(content)) !== null) {
        let imgUrl = match[1];
        // Make absolute URL
        if (imgUrl.startsWith('http')) {
          images.push(imgUrl);
        } else if (imgUrl.startsWith('/')) {
          images.push(`https://raw.githubusercontent.com/${repo}/main${imgUrl}`);
        } else {
          images.push(`https://raw.githubusercontent.com/${repo}/main/${imgUrl}`);
        }
      }
      
      // Filter: prefer demo/screenshot images, skip badges
      const good = images.filter(u => 
        !u.includes('badge') && 
        !u.includes('shields.io') &&
        !u.includes('img.shields.io') &&
        !u.includes('crates.io') &&
        !u.includes('sponsor') &&
        (u.includes('demo') || u.includes('screenshot') || u.includes('preview') || u.includes('example') || images.length <= 3)
      );
      
      return good.length > 0 ? good : images;
    } catch {
      continue;
    }
  }
  return [];
}

// ── Main ──
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/screenshot-upload.cjs <url|repo>');
    console.log('  <url>   Full URL to screenshot (GitHub repo or website)');
    console.log('  <repo>  GitHub repo (user/repo) — finds README image first');
    process.exit(1);
  }
  
  const input = args[0];
  let githubRepo = null;
  let targetUrl = null;
  
  if (input.includes('github.com')) {
    // Extract repo from URL
    const match = input.match(/github\.com\/([^/]+\/[^/]+)/);
    if (match) githubRepo = match[1];
    targetUrl = input;
  } else if (input.includes('/')) {
    // Assume user/repo format
    githubRepo = input;
    targetUrl = `https://github.com/${input}`;
  } else {
    targetUrl = input;
  }
  
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  
  console.log(`\n=== Screenshot Pipeline ===`);
  console.log(`Target: ${targetUrl}`);
  
  // Step 1: Try to find README image
  if (githubRepo) {
    console.log(`\n[1] Checking README for images...`);
    const images = await findReadmeImages(githubRepo);
    
    if (images.length > 0) {
      console.log(`  Found ${images.length} image(s):`);
      images.slice(0, 3).forEach((u, i) => console.log(`    ${i + 1}. ${u.slice(0, 80)}`));
      
      // Download first good image
      const imgUrl = images[0];
      const ext = path.extname(new URL(imgUrl).pathname) || '.png';
      const localPath = path.join(SCREENSHOT_DIR, `${githubRepo.replace('/', '-')}${ext}`);
      
      console.log(`\n[2] Downloading: ${imgUrl.slice(0, 60)}...`);
      await new Promise((resolve, reject) => {
        const getter = imgUrl.startsWith('https') ? https : http;
        getter.get(imgUrl, (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            // Follow redirect
            getter.get(res.headers.location, (res2) => {
              const chunks = [];
              res2.on('data', c => chunks.push(c));
              res2.on('end', () => {
                fs.writeFileSync(localPath, Buffer.concat(chunks));
                resolve();
              });
            }).on('error', reject);
          } else {
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => {
              fs.writeFileSync(localPath, Buffer.concat(chunks));
              resolve();
            });
          }
        }).on('error', reject);
      });
      
      console.log(`  Saved: ${localPath}`);
      
      // Step 3: Upload to catbox
      console.log(`\n[3] Uploading to catbox.moe...`);
      const publicUrl = await uploadToCatbox(localPath);
      console.log(`  URL: ${publicUrl}`);
      
      console.log(`\n=== Result ===`);
      console.log(JSON.stringify({ url: publicUrl, source: 'readme', local: localPath }));
      return;
    }
    
    console.log(`  No images found in README`);
  }
  
  // Step 2: Take browser screenshot (agent must do this)
  console.log(`\n[2] No README image available.`);
  console.log(`  Agent should take browser screenshot of: ${targetUrl}`);
  console.log(`  Then upload the screenshot file to catbox.moe`);
  console.log(`  Command: node scripts/screenshot-upload.cjs --upload <path_to_screenshot>`);
  
  // If --upload flag, just upload a file
  if (args.includes('--upload')) {
    const filePath = args[args.indexOf('--upload') + 1];
    if (filePath && fs.existsSync(filePath)) {
      console.log(`\nUploading: ${filePath}`);
      const publicUrl = await uploadToCatbox(filePath);
      console.log(`URL: ${publicUrl}`);
      console.log(JSON.stringify({ url: publicUrl, source: 'upload', local: filePath }));
    } else {
      console.error(`File not found: ${filePath}`);
    }
  }
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
