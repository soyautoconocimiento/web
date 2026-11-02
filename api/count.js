// v4: adds path; results go to Vercel's logs instead of a public debug flag.
// Sends 'campaign' because Google Apps Script reserves the parameter name 'c'.
// Anonymous scan counter: no IP, no cookies, no IDs. Apps Script validates every field.
const SLUG = /^[a-z0-9_-]{1,40}$/;
const EVENT = /^(scan|visit)$/;

// Approximate: iPads since iPadOS 13 present themselves as Macs, so they count as desktop.
function deviceOf(ua) {
  if (/iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return 'tablet';
  if (/Mobi|iPhone|Android/i.test(ua)) return 'mobile';
  return 'desktop';
}

module.exports = async (req, res) => {
  const q = req.query || {};
  const h = req.headers || {};
  const code = String(q.c || '').toLowerCase();
  const event = String(q.e || 'scan');
  const url = process.env.SHEET_WEBHOOK_URL;
  const secret = process.env.SHEET_SECRET;
  let result = 'skipped';
  if (!url || !secret) {
    result = 'missing-env';
  } else if (SLUG.test(code) && EVENT.test(event)) {
    const params = new URLSearchParams({
      secret, campaign: code, event, v: '4',
      country: String(h['x-vercel-ip-country'] || ''),
      region: String(h['x-vercel-ip-country-region'] || ''),
      device: deviceOf(String(h['user-agent'] || '')),
      lang: String(h['accept-language'] || '').slice(0, 2).toLowerCase(),
      sections: String(q.s || '').slice(0, 900),
      buttons: String(q.b || '').slice(0, 900),
      wa: String(q.w || '').slice(0, 40),
      duration: String(q.d || '').slice(0, 10),
      path: String(q.p || '').slice(0, 1700),
    });
    try {
      const r = await fetch(url + '?' + params);
      result = (await r.text()).slice(0, 60);
    } catch (err) {
      result = 'fetch-failed';
    }
  }
  res.setHeader('Cache-Control', 'no-store');
  console.log('count result: ' + result);
  res.status(204).end();

};
