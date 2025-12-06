const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const config = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

// Add endpoint if specified (for MinIO or other S3-compatible services)
if (process.env.AWS_ENDPOINT) {
  config.endpoint = process.env.AWS_ENDPOINT;
  config.forcePathStyle = true; // Required for MinIO
}

const s3Client = new S3Client(config);

/**
 * Uploads a single file to S3
 */
const uploadFile = async (filePath, key) => {
  const fileStream = fs.createReadStream(filePath);
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: fileStream,
    },
  });

  return upload.done();
};

/**
 * Uploads an entire folder to S3 (recursive)
 */
const uploadFolder = async (dirPath, s3Prefix) => {
  const files = fs.readdirSync(dirPath);
  
  const uploadPromises = files.map(async (file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await uploadFolder(filePath, `${s3Prefix}/${file}`);
    } else {
      const s3Key = `${s3Prefix}/${file}`;
      await uploadFile(filePath, s3Key);
    }
  });

  await Promise.all(uploadPromises);
};

module.exports = {
  s3Client,
  uploadFile,
  uploadFolder,
};
