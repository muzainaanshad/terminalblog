#!/usr/bin/env node
/**
 * Pull GSC + GA4 data for terminalblog.
 * Usage: node scripts/pull-gsc-ga4.cjs
 */
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const KEY_FILE = path.join(__dirname, '..', 'credentials', 'gsc-service-account.json');
const SITE_URL = 'sc-domain:terminalblog.com';
const GA4_PROPERTY = '545105870';

async function getAuth() {
  const key = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: [
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/analytics.readonly',
    ],
  });
  return auth;
}

async function gscQueries(auth) {
  const searchconsole = google.searchconsole({ version: 'v1', auth });
  
  // Date range: last 7 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const fmt = d => d.toISOString().split('T')[0];

  console.log('\n=== GSC: Top Queries (last 7 days) ===');
  try {
    const res = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: fmt(startDate),
        endDate: fmt(endDate),
        rowLimit: 20,
        dimensions: ['query'],
      },
    });
    const rows = res.data.rows || [];
    rows.forEach((r, i) => {
      console.log(`  ${i+1}. "${r.keys[0]}" — ${r.clicks} clicks, ${r.impressions} imp, CTR ${(r.ctr*100).toFixed(1)}%, pos ${r.position.toFixed(1)}`);
    });
  } catch (e) {
    console.log('  GSC query error:', e.message);
  }

  console.log('\n=== GSC: Top Pages (last 7 days) ===');
  try {
    const res = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: fmt(startDate),
        endDate: fmt(endDate),
        rowLimit: 15,
        dimensions: ['page'],
      },
    });
    const rows = res.data.rows || [];
    rows.forEach((r, i) => {
      const page = r.keys[0].replace('https://terminalblog.com', '');
      console.log(`  ${i+1}. ${page} — ${r.clicks} clicks, ${r.impressions} imp`);
    });
  } catch (e) {
    console.log('  GSC pages error:', e.message);
  }

  console.log('\n=== GSC: Pages with Errors/404s ===');
  try {
    const res = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: fmt(startDate),
        endDate: fmt(endDate),
        rowLimit: 20,
        dimensions: ['page'],
        dimensionFilterGroups: [{
          filters: [{
            dimension: 'query',
            expression: '',
          }],
        }],
      },
    });
  } catch (e) {
    // ignore
  }

  // Check coverage errors
  try {
    const res = await searchconsole.urlInspection.index.inspect({
      siteUrl: SITE_URL,
      inspectionUrl: SITE_URL,
    });
    console.log('\n=== GSC: Site Inspection ===');
    console.log('  Coverage state:', res.data.inspectionResult.indexStatusResult?.verdict || 'unknown');
  } catch (e) {
    // ignore
  }
}

async function ga4Pages(auth) {
  const analyticsdata = google.analyticsdata({ version: 'v1beta', auth });
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const fmt = d => d.toISOString().split('T')[0];

  console.log('\n=== GA4: Top Pages (last 7 days) ===');
  try {
    const res = await analyticsdata.properties.runReport({
      property: `properties/${GA4_PROPERTY}`,
      requestBody: {
        dateRanges: [{ startDate: fmt(startDate), endDate: fmt(endDate) }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
        ],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 20,
      },
    });
    const rows = res.data.rows || [];
    rows.forEach((r, i) => {
      const page = r.dimensionValues[0].value;
      const views = r.metricValues[0].value;
      const duration = parseFloat(r.metricValues[1].value).toFixed(0);
      const bounce = (parseFloat(r.metricValues[2].value)*100).toFixed(0);
      console.log(`  ${i+1}. ${page} — ${views} views, ${duration}s avg, ${bounce}% bounce`);
    });
  } catch (e) {
    console.log('  GA4 error:', e.message);
  }

  console.log('\n=== GA4: Traffic Sources (last 7 days) ===');
  try {
    const res = await analyticsdata.properties.runReport({
      property: `properties/${GA4_PROPERTY}`,
      requestBody: {
        dateRanges: [{ startDate: fmt(startDate), endDate: fmt(endDate) }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      },
    });
    const rows = res.data.rows || [];
    rows.forEach((r, i) => {
      console.log(`  ${i+1}. ${r.dimensionValues[0].value} — ${r.metricValues[0].value} sessions`);
    });
  } catch (e) {
    console.log('  GA4 sources error:', e.message);
  }

  console.log('\n=== GA4: 404 Pages (last 7 days) ===');
  try {
    const res = await analyticsdata.properties.runReport({
      property: `properties/${GA4_PROPERTY}`,
      requestBody: {
        dateRanges: [{ startDate: fmt(startDate), endDate: fmt(endDate) }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        dimensionFilterGroups: [{
          filters: [{
            dimension: { dimensionName: 'pagePath' },
            stringFilter: { matchType: 'CONTAINS', value: '404' },
          }],
        }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 20,
      },
    });
    const rows = res.data.rows || [];
    if (rows.length === 0) {
      console.log('  No 404 pages found in GA4');
    } else {
      rows.forEach((r, i) => {
        console.log(`  ${i+1}. ${r.dimensionValues[0].value} — ${r.metricValues[0].value} views`);
      });
    }
  } catch (e) {
    console.log('  GA4 404 error:', e.message);
  }
}

async function main() {
  console.log('Pulling GSC + GA4 data for terminalblog.com...\n');
  const auth = await getAuth();
  
  await gscQueries(auth);
  await ga4Pages(auth);
  
  console.log('\nDone.');
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
