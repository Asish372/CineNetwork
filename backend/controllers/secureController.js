const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const SECRET = process.env.TOKEN_SECRET || "super_secret_key_change_me_in_prod";

// Generate Token
exports.getToken = (req, res) => {
  // In a real app, validate user session here
  const payload = { sub: "mobile-client" };
  // Short-lived token (2 minutes)
  const token = jwt.sign(payload, SECRET, { expiresIn: '2m' }); 
  res.json({ token });
};

// Proxy / Secure Stream
exports.secureStream = async (req, res) => {
  try {
    // 1. Validate Token
    const auth = req.headers.authorization;
    const queryToken = req.query.token; // Also support query param for initial manifest request if needed
    
    let token = '';
    if (auth && auth.startsWith('Bearer ')) {
      token = auth.split(' ')[1];
    } else if (queryToken) {
      token = queryToken;
    }

    if (!token) return res.status(401).send('No token provided');

    try {
      jwt.verify(token, SECRET);
    } catch (err) {
      return res.status(401).send('Invalid or expired token');
    }

    // 2. Resolve Content
    // RegExp params: /stream/(contentId)/(file) -> params[0], params[1]
    const contentId = req.params[0];
    const file = req.params[1];

    // Determine Source (Local or MinIO)
    // Since we are using MinIO/S3 logic in videoController, let's proxy to MinIO or serve locally if available.
    // For simplicity and performance, if file is local, serve it.
    
    const localPath = path.join(__dirname, '..', 'public', 'videos', contentId, file);
    
    if (fs.existsSync(localPath)) {
        return res.sendFile(localPath);
    }

    // Fallback: Proxy to MinIO (if not local)
    // Construction MinIO URL
    const endpoint = process.env.AWS_ENDPOINT || 'http://192.168.0.103:9000';
    const bucket = process.env.AWS_BUCKET_NAME || 'cinenetwork';
    const s3Key = `videos/${contentId}/${file}`;
    const targetUrl = `${endpoint}/${bucket}/${s3Key}`;

    const response = await fetch(targetUrl);
    
    if (!response.ok) {
        return res.status(response.status).send('Content not found on storage');
    }

    // Pipe response
    res.status(response.status);
    response.body.pipe(res);

  } catch (error) {
    console.error('Secure Stream Error:', error);
    res.status(500).send('Server Error');
  }
};
