const fs = require('fs-extra');
const path = require('path');

// Public directory where videos will be served from
const publicDir = path.join(__dirname, '..', 'public', 'videos');

/**
 * Moves the transcoded HLS folder to the public directory.
 * @param {string} sourceDir - The temporary directory containing HLS files.
 * @param {string} contentId - The unique ID of the content.
 * @returns {Promise<string>} - The destination directory path.
 */
exports.saveHLS = async (sourceDir, contentId) => {
  const destDir = path.join(publicDir, contentId);
  
  // Ensure destination exists and is empty
  await fs.ensureDir(destDir);
  await fs.emptyDir(destDir);
  
  // Move files
  await fs.copy(sourceDir, destDir);
  
  return destDir;
};
