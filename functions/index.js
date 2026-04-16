const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Initialize Firebase Admin
const admin = require('firebase-admin');
admin.initializeApp();

const DALSI_API_BASE = 'https://api.neodalsi.com';

const ALLOWED_ORIGINS = [
  'https://neodalsi.com',
  'https://www.neodalsi.com',
  'https://innate-temple-337717.web.app',
  'https://innate-temple-337717.firebaseapp.com'
];

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://neodalsi.com');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
}

/**
 * API Proxy — true catch-all reverse proxy to api.neodalsi.com
 *
 * How path extraction works:
 *   - When called via Firebase Hosting rewrite (neodalsi.com/api/**):
 *       req.path = '/api/auth/guest-key'  (Firebase sets this correctly)
 *       x-forwarded-url header also contains the original path
 *   - When called directly (cloudfunctions.net/apiProxy/api/**):
 *       req.path = '/api/auth/guest-key'  (Express routing)
 *
 * The function strips any leading /apiProxy prefix and forwards the rest
 * to https://api.neodalsi.com with the original method, headers, and body.
 *
 * Handles all routes:
 *   /generate, /edu/*, /healthcare/*, /api/*, /vertosession/*
 */
exports.apiProxy = functions
  .runWith({ timeoutSeconds: 120, memory: '256MB' })
  .https.onRequest((req, res) => {
    setCorsHeaders(req, res);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return res.status(204).send('');
    }

    try {
      // Extract the target path.
      // Firebase Hosting rewrites set x-forwarded-url to the original path.
      // When called directly on cloudfunctions.net, req.path contains the full path.
      const forwardedUrl = req.headers['x-forwarded-url'] || '';
      let targetPath;

      if (forwardedUrl) {
        // x-forwarded-url may be a full URL or just a path
        try {
          const fwdParsed = new URL(forwardedUrl, 'https://neodalsi.com');
          targetPath = fwdParsed.pathname;
        } catch (e) {
          targetPath = forwardedUrl.split('?')[0];
        }
      } else {
        // Fallback: use req.path, strip /apiProxy prefix if present
        const rawPath = req.path || req.originalUrl || '/';
        targetPath = rawPath.replace(/^\/apiProxy/, '') || '/';
      }

      console.log(`[apiProxy] ${req.method} ${targetPath} (fwd=${forwardedUrl})`);

      const targetUrl = new URL(targetPath, DALSI_API_BASE);

      // Forward query string parameters
      Object.entries(req.query || {}).forEach(([k, v]) => {
        targetUrl.searchParams.set(k, v);
      });

      const isHttps = targetUrl.protocol === 'https:';
      const lib = isHttps ? https : http;

      // Serialize body correctly:
      // Firebase body-parser already parsed JSON into req.body object.
      // Re-serialize only for non-GET/HEAD requests that have a body.
      let bodyBuffer = null;
      const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
      if (hasBody && req.body !== undefined && req.body !== null) {
        const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        bodyBuffer = Buffer.from(bodyStr, 'utf8');
      }

      const contentType = req.headers['content-type'] || 'application/json';

      const options = {
        hostname: targetUrl.hostname,
        port: targetUrl.port || (isHttps ? 443 : 80),
        path: targetUrl.pathname + targetUrl.search,
        method: req.method,
        headers: {
          'Content-Type': contentType,
          'Host': targetUrl.hostname,
          'User-Agent': 'DalsiPortal-Proxy/2.0',
          ...(req.headers['authorization'] ? { 'Authorization': req.headers['authorization'] } : {}),
          ...(req.headers['x-api-key'] ? { 'X-API-Key': req.headers['x-api-key'] } : {}),
          ...(bodyBuffer ? { 'Content-Length': bodyBuffer.length } : {})
        }
      };

      const proxyReq = lib.request(options, (proxyRes) => {
        res.status(proxyRes.statusCode);

        // Forward safe response headers
        const forwardHeaders = ['content-type', 'cache-control', 'x-request-id', 'x-ratelimit-remaining'];
        forwardHeaders.forEach(h => {
          if (proxyRes.headers[h]) res.setHeader(h, proxyRes.headers[h]);
        });

        const chunks = [];
        proxyRes.on('data', chunk => chunks.push(chunk));
        proxyRes.on('end', () => {
          const responseBody = Buffer.concat(chunks);
          console.log(`[apiProxy] Response ${proxyRes.statusCode} from ${targetUrl.pathname} (${responseBody.length} bytes)`);
          res.end(responseBody);
        });
      });

      proxyReq.on('error', (err) => {
        console.error('[apiProxy] Request error:', err.message);
        res.status(502).json({ error: 'Proxy error', details: err.message });
      });

      if (bodyBuffer) proxyReq.write(bodyBuffer);
      proxyReq.end();

    } catch (err) {
      console.error('[apiProxy] Internal error:', err.message);
      res.status(500).json({ error: 'Internal proxy error', details: err.message });
    }
  });

/**
 * Send verification email to new users
 * This is an HTTP function that accepts POST requests
 * NO AUTHENTICATION REQUIRED - allows unauthenticated calls for registration
 */
const cors = require('cors')({origin: true});

exports.sendVerificationEmail = functions.https.onRequest((req, res) => {
  // Enable CORS
  cors(req, res, async () => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({error: 'Method not allowed'});
    }

    try {
      // Extract data from request body
      const { email, userId, firstName, verificationUrl } = req.body;

      // Validate required fields
      if (!email || !userId || !verificationUrl) {
        return res.status(400).json({
          error: 'Missing required fields: email, userId, or verificationUrl'
        });
      }

      // Email configuration - using hardcoded credentials for now
      // TODO: Move to Firebase config or environment variables in production
      const emailUser = 'dalsiainoreply@gmail.com';
      const emailPass = 'gubk utmj gsjh sbar'; // Gmail app password

      // Create nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });

      // Email HTML template
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome to Dalsi AI! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName || 'there'},</p>
            <p>Thank you for joining <strong>Dalsi AI & Automations</strong>! We're excited to have you on board.</p>
            <p>To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            <p><strong>Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
            <p>If you didn't create an account with Dalsi AI, please ignore this email.</p>
            <p>Best regards,<br>The Dalsi AI Team</p>
          </div>
          <div class="footer">
            <p>© 2025 Dalsi AI & Automations. All rights reserved.</p>
            <p>Artificial Intelligence Made Real ✨</p>
          </div>
        </body>
        </html>
      `;

      // Email options
      const mailOptions = {
        from: `"Dalsi AI" <${emailUser}>`,
        to: email,
        subject: '✨ Verify Your Dalsi AI Account',
        html: emailHtml
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);
      
      console.log('Verification email sent successfully:', {
        messageId: info.messageId,
        email: email,
        userId: userId
      });

      return res.status(200).json({
        success: true,
        message: 'Verification email sent successfully',
        messageId: info.messageId
      });

    } catch (error) {
      console.error('Error sending verification email:', error);
      return res.status(500).json({
        error: 'Failed to send verification email',
        details: error.message
      });
    }
  });
});
