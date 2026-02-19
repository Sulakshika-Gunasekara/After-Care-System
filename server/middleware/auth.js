/**
 * Basic API Key authentication middleware.
 * 
 * In development (no API_KEY env var set), all requests pass through.
 * In production, set the API_KEY environment variable and clients must
 * include the `X-API-Key` header with the matching value.
 * 
 * Usage in server.js:
 *   const { authMiddleware } = require('./middleware/auth');
 *   app.use('/api', authMiddleware);
 */

function authMiddleware(req, res, next) {
  const apiKey = process.env.API_KEY;

  // If no API_KEY is configured, allow all requests (dev mode)
  if (!apiKey) {
    return next();
  }

  const provided = req.headers['x-api-key'];

  if (!provided) {
    return res.status(401).json({ error: 'Missing X-API-Key header' });
  }

  if (provided !== apiKey) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  next();
}

module.exports = { authMiddleware };
