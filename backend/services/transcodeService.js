const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs-extra');
const path = require('path');

// Ensure ffmpeg is in your PATH or set it here
// ffmpeg.setFfmpegPath('/path/to/ffmpeg'); 

const RESOLUTIONS = [
  { name: '1080p', width: 1920, height: 1080, bitrate: '5000k' },
  { name: '720p', width: 1280, height: 720, bitrate: '2800k' },
  { name: '480p', width: 854, height: 480, bitrate: '1400k' },
  { name: '360p', width: 640, height: 360, bitrate: '800k' },
  { name: '240p', width: 426, height: 240, bitrate: '400k' },
];

/**
 * Transcodes a video file to HLS format with multiple bitrates.
 * @param {string} inputPath - Path to the source MP4 file.
 * @param {string} outputDir - Directory to save the HLS files.
 * @returns {Promise<string>} - Path to the master playlist file.
 */
const transcodeToHLS = (inputPath, outputDir) => {
  return new Promise((resolve, reject) => {
    // Ensure output directory exists
    fs.ensureDirSync(outputDir);

    const masterPlaylistPath = path.join(outputDir, 'master.m3u8');
    
    // Initialize FFmpeg command
    let command = ffmpeg(inputPath);

    // Add variants for each resolution
    RESOLUTIONS.forEach((res) => {
      const variantOutput = path.join(outputDir, `${res.name}.m3u8`);
      
      command = command
        .output(variantOutput)
        .videoCodec('libx264')
        .audioCodec('aac')
        .audioBitrate('128k')
        .videoBitrate(res.bitrate)
        .size(`${res.width}x${res.height}`)
        .addOption('-hls_time', '10') // 10 second segments
        .addOption('-hls_playlist_type', 'vod')
        .addOption('-hls_segment_filename', path.join(outputDir, `${res.name}_%03d.ts`));
    });

    // Generate Master Playlist manually (fluent-ffmpeg doesn't auto-generate master playlist for multi-output closely easily, 
    // but we can construct it or use a complex filter. For simplicity, we'll write the master playlist file after verification)
    
    // ACTUALLY: A better approach with fluent-ffmpeg for HLS variants is often running separate commands 
    // or using a specific map strategy. However, let's use a simpler strategy: 
    // Iterate and create variants, then write master.m3u8.
    
    // BUT to keep it efficient (single pass), lets try to chain outputs.
    // NOTE: Single pass multi-bitrate HLS with ffmpeg can be complex. 
    // Let's stick to a robust simpler loop for now or a single command with multiple outputs.
    
    command
      .on('start', (cmdLine) => {
        console.log('Spawned Ffmpeg with command: ' + cmdLine);
      })
      .on('error', (err) => {
        console.error('An error occurred: ' + err.message);
        reject(err);
      })
      .on('end', () => {
        console.log('Transcoding finished!');
        createMasterPlaylist(outputDir, RESOLUTIONS);
        resolve(masterPlaylistPath);
      })
      .run();
  });
};

/**
 * Creates the master.m3u8 file referencing the variants.
 */
const createMasterPlaylist = (outputDir, resolutions) => {
  let masterContent = '#EXTM3U\n#EXT-X-VERSION:3\n';

  resolutions.forEach((res) => {
    // bandwidth is roughly bitrate * 1000 * 1.5 for overhead
    const bandwidth = parseInt(res.bitrate.replace('k', '')) * 1000 * 1.2; 
    masterContent += `#EXT-X-STREAM-INF:BANDWIDTH=${Math.floor(bandwidth)},RESOLUTION=${res.width}x${res.height}\n`;
    masterContent += `${res.name}.m3u8\n`;
  });

  fs.writeFileSync(path.join(outputDir, 'master.m3u8'), masterContent);
};

module.exports = {
  transcodeToHLS,
};
