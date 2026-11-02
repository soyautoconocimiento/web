// Anonymous scan counter: forwards only the campaign name. No IP, no cookies.
// v2: sends 'campaign' (Google Apps Script reserves the parameter name 'c').

const VALID = /^[a-z0-9_-]{1,40}$/;

module.exports = async (req, res) => {
  const c = String((req.query && req.query.c) || '').toLowerCase();
  const url = process.env.SHEET_WEBHOOK_URL;
  const secret = process.env.SHEET_SECRET;
  let result = 'skipped';
  if (!url || !secret) {
    result = 'missing-env';
  } else if (VALID.test(c)) {
    try {
      const r = await fetch(url + '?' + new URLSearchParams({ campaign: c, secret }));
      result = (await r.text()).slice(0, 60);
    } catch (e) {
      result = 'fetch-failed';
    }
  }
  res.setHeader('Cache-Control', 'no-store');
  if (req.query && req.query.debug === '1') {
    res.status(200).send(result);
  } else {
    res.status(204).end();
  }
};
