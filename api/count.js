// Anonymous scan counter: forwards only the campaign name. No IP, no cookies.
const VALID = /^[a-z0-9_-]{1,40}$/;

module.exports = async (req, res) => {
  const c = String((req.query && req.query.c) || '').toLowerCase();
  const url = process.env.SHEET_WEBHOOK_URL;
  const secret = process.env.SHEET_SECRET;
  if (VALID.test(c) && url && secret) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ c, secret }).toString(),
      });
    } catch (e) {}
  }
  res.setHeader('Cache-Control', 'no-store');
  res.status(204).end();
};
