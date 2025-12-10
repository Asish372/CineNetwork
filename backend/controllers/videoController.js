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
  const tempOutputDir = path.join(TEMP_DIR, 'hls', contentId);
  const publicOutputDir = path.join(__dirname, '..', 'public', 'videos', contentId);
  
  // Create public output dir
  await fs.ensureDir(publicOutputDir);

  try {
    console.log(`[${contentId}] Starting Transcoding...`);
    await transcodeToHLS(inputPath, tempOutputDir);
    console.log(`[${contentId}] Transcoding Complete.`);

    // Move to Public Directory (Local Persistence)
    console.log(`[${contentId}] Moving/Copying to Local Public Storage...`);
    await fs.copy(tempOutputDir, publicOutputDir);
    console.log(`[${contentId}] Local Storage Updated: ${publicOutputDir}`);

    // Optional: Upload to MinIO (Best Effort)
    try {
        console.log(`[${contentId}] Uploading to Storage (MinIO)...`);
        const s3Prefix = `videos/${contentId}`;
        await uploadFolder(tempOutputDir, s3Prefix);
        console.log(`[${contentId}] Upload to Storage Complete.`);
    } catch (e) {
        console.warn(`[${contentId}] MinIO Upload Skipped/Failed (using local copy):`, e.message);
    }
   
    console.log(`[${contentId}] Video processing finished successfully.`);

    // Cleanup Temp
    await fs.remove(inputPath);
    await fs.remove(tempOutputDir);

  } catch (error) {
    console.error(`[${contentId}] Background Processing Failed:`, error);
    await fs.remove(inputPath);
    await fs.remove(tempOutputDir);
  }
};

exports.getVideoUrl = async (req, res) => {
  try {
    const { contentId } = req.params;
    
    // 0. Fetch Content Metadata
    let content = await Content.findByPk(contentId);
    let episode = null;

    // If not found in Content, try Episode (Format: ep-123 or just 123)
    if (!content) {
        // Try parsing ID (if it has prefix)
        const epId = contentId.toString().replace('ep-', '');
        const { Episode } = require('../models');
        episode = await Episode.findByPk(epId);
        
        if (!episode) {
             return res.status(404).json({ message: 'Content/Episode not found' });
        }
        
        // If Episode found, get its parent Content (Season -> Series) to check VIP status if needed
        // But first, check isFree
        if (episode.isFree) {
            // It's Free! Bypass checks.
            // Retrieve video URL from Episode
            if (episode.manifestUrl) { 
                // Return HLS URL
                 return res.json({ videoUrl: episode.manifestUrl });
            } else if (episode.videoUrl) {
                 return res.json({ videoUrl: episode.videoUrl });
            }
             // Fallback to S3 construction
             const endpoint = process.env.AWS_ENDPOINT || 'http://localhost:9000';
             const bucket = process.env.AWS_BUCKET_NAME || 'cinenetwork';
             const s3Key = `episodes/${episode.id}/master.m3u8`; // Assuming path convention
             return res.json({ videoUrl: `${endpoint}/${bucket}/${s3Key}` });
        }
        
        // If NOT Free, find parent content to check isVip
        // For now, assume all non-free episodes inherit Series VIP status
        // We need to fetch the Season first
        const { Season } = require('../models');
        const season = await Season.findByPk(episode.seasonId);
        if (season) {
            content = await Content.findByPk(season.seriesId);
        }
    }

    if (!content) {
         return res.status(404).json({ message: 'Content not found' });
    }

    // 0.5 Check VIP Access
    if (content.isVip) {
        // If user is not logged in
        if (!req.user) {
             return res.status(401).json({ 
                 message: 'Login required for VIP content', 
                 code: 'AUTH_REQUIRED' 
             });
        }

        // Check for Active Subscription
        const { UserSubscription } = require('../models');
        const activeSub = await UserSubscription.findOne({
            where: {
                userId: req.user.id,
                status: 'active',
                endDate: { [require('sequelize').Op.gt]: new Date() } // Expires in future
            }
        });

        if (!activeSub) {
            return res.status(403).json({ 
                message: 'Subscription required to watch this content',
                code: 'SUBSCRIPTION_REQUIRED'
            });
        }
    }

    
    // 1. Check if Local HLS exists
    const localHlsPath = path.join(__dirname, '..', 'public', 'videos', contentId, 'master.m3u8');
    
        if (fs.existsSync(localHlsPath)) {
        // Construct public MinIO/Proxy URL
        const endpoint = process.env.AWS_ENDPOINT || 'http://localhost:9000'; // Default to localhost if env missing
        const bucket = process.env.AWS_BUCKET_NAME || 'cinenetwork';
        const s3Key = `videos/${contentId}/master.m3u8`;
        const videoUrl = `${endpoint}/${bucket}/${s3Key}`;
        return res.json({ videoUrl });
    }

    // 2. Fallback: Return original URL if exists
    if (content.videoUrl) {
         return res.json({ videoUrl: content.videoUrl });
    }

    // 3. Last Resort: S3
    const endpoint = process.env.AWS_ENDPOINT || 'http://localhost:9000';
    const bucket = process.env.AWS_BUCKET_NAME || 'cinenetwork';
    const s3Key = `videos/${contentId}/master.m3u8`;
    const videoUrl = `${endpoint}/${bucket}/${s3Key}`;
    
    res.json({ videoUrl });

  } catch (error) {
    console.error('Error generating URL:', error);
    res.status(500).json({ message: 'Could not generate URL' });
  }
};
