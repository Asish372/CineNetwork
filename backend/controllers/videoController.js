const path = require('path');
const fs = require('fs-extra');
const { getSignedUrl } = require('@aws-sdk/cloudfront-signer');
// Re-import s3Service instead of storageService
const { transcodeToHLS } = require('../services/transcodeService');
const { uploadFolder } = require('../services/s3Service');
const { Content } = require('../models');

// Temporary directory for uploads and transcoding
const TEMP_DIR = path.join(__dirname, '..', 'temp');

exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { contentId } = req.body; 
    if (!contentId) {
        fs.removeSync(req.file.path);
        return res.status(400).json({ message: 'Content ID is required' });
    }

    res.status(202).json({ message: 'Video uploaded. Transcoding and processing started in background.' });

    // Background Processing
    processVideo(req.file, contentId);

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Server Error during upload' });
  }
};

const processVideo = async (file, contentId) => {
  const inputPath = file.path;
  const outputDir = path.join(TEMP_DIR, 'hls', contentId);
  // MinIO buckets don't usually need folders if specific bucket is used, but prefixes are good organization
  const s3Prefix = `videos/${contentId}`;

  try {
    console.log(`[${contentId}] Starting Transcoding...`);
    await transcodeToHLS(inputPath, outputDir);
    console.log(`[${contentId}] Transcoding Complete.`);

    console.log(`[${contentId}] Uploading to Storage (MinIO)...`);
    await uploadFolder(outputDir, s3Prefix);
    console.log(`[${contentId}] Upload to Storage Complete.`);

    console.log(`[${contentId}] Video processing finished successfully.`);

    // Cleanup
    await fs.remove(inputPath);
    await fs.remove(outputDir);

  } catch (error) {
    console.error(`[${contentId}] Background Processing Failed:`, error);
    await fs.remove(inputPath);
    await fs.remove(outputDir);
  }
};

exports.getVideoUrl = (req, res) => {
  // For MinIO, we return the public URL directly if buckets are public
  // Or generated presigned URL if private.
  // For simplicity and matching "online" requirement, let's assume public bucket or generate presigned URL.
  // BUT the user asked for "without AWS", so likely no CloudFront.
  // So we use standard S3 presigned URL from the SDK, NOT CloudFront.
  
  try {
    const { contentId } = req.params;
    const s3Key = `videos/${contentId}/master.m3u8`;

    // Construct public MinIO URL
    // Format: http://minio-server:9000/bucket/key
    const endpoint = process.env.AWS_ENDPOINT || 'http://localhost:9000';
    const bucket = process.env.AWS_BUCKET_NAME;
    
    const videoUrl = `${endpoint}/${bucket}/${s3Key}`;
    
    res.json({ videoUrl });
  } catch (error) {
    console.error('Error generating URL:', error);
    res.status(500).json({ message: 'Could not generate URL' });
  }
};
