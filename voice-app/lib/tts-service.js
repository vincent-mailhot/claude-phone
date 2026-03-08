/**
 * Text-to-Speech Service using espeak-ng
 * Free, local TTS — no API key required.
 * Generates WAV files and returns HTTP URLs for FreeSWITCH playback.
 */

const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const logger = require('./logger');

// Audio output directory (updated via setAudioDir)
let audioDir = path.join(__dirname, '../audio-temp');

/**
 * Set the audio output directory
 * @param {string} dir - Absolute path to audio directory
 */
function setAudioDir(dir) {
  audioDir = dir;

  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
    logger.info('Created audio directory', { path: audioDir });
  }
}

/**
 * Generate unique filename for an audio file
 * @param {string} text - Text being converted
 * @returns {string} Filename (without path)
 */
function generateFilename(text) {
  const hash = crypto.createHash('md5').update(text).digest('hex').substring(0, 8);
  const timestamp = Date.now();
  return 'tts-' + timestamp + '-' + hash + '.wav';
}

/**
 * Convert text to speech using espeak-ng
 * @param {string} text - Text to convert
 * @param {string|null} _voiceId - Ignored (kept for API compatibility)
 * @returns {Promise<string>} HTTP URL to the generated WAV file
 */
async function generateSpeech(text, _voiceId) {
  const startTime = Date.now();
  const filename = generateFilename(text);
  const filepath = path.join(audioDir, filename);

  return new Promise(function(resolve, reject) {
    const args = [
      '-v', process.env.ESPEAK_VOICE || 'en',   // voice (default English)
      '-s', process.env.ESPEAK_SPEED || '140',   // words per minute
      '-p', process.env.ESPEAK_PITCH || '50',    // pitch (0-99)
      '-a', process.env.ESPEAK_AMP   || '100',   // amplitude (0-200)
      '-w', filepath,                             // output WAV file
      text
    ];

    execFile('espeak-ng', args, function(error) {
      if (error) {
        logger.error('espeak-ng TTS generation failed', { error: error.message, text: text.substring(0, 80) });
        return reject(new Error('espeak-ng TTS generation failed: ' + error.message));
      }

      const latency = Date.now() - startTime;
      logger.info('Speech generated', { filename: filename, latency: latency });

      const port = process.env.HTTP_PORT || 3000;
      const audioUrl = 'http://127.0.0.1:' + port + '/audio-files/' + filename;
      resolve(audioUrl);
    });
  });
}

/**
 * Delete WAV files older than maxAgeMs
 * @param {number} maxAgeMs - Maximum file age in ms (default 1 hour)
 */
function cleanupOldFiles(maxAgeMs) {
  maxAgeMs = maxAgeMs || 60 * 60 * 1000;

  try {
    const now = Date.now();
    const files = fs.readdirSync(audioDir);
    let deletedCount = 0;

    files.forEach(function(file) {
      if (!file.startsWith('tts-') || !file.endsWith('.wav')) return;

      const filepath = path.join(audioDir, file);
      const stats = fs.statSync(filepath);

      if (now - stats.mtimeMs > maxAgeMs) {
        fs.unlinkSync(filepath);
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      logger.info('Cleaned up old audio files', { deletedCount: deletedCount });
    }
  } catch (error) {
    logger.warn('Failed to cleanup old audio files', { error: error.message });
  }
}

// Initialize audio directory
setAudioDir(audioDir);

// Periodic cleanup every 30 minutes
setInterval(function() { cleanupOldFiles(); }, 30 * 60 * 1000);

module.exports = {
  generateSpeech,
  setAudioDir,
  cleanupOldFiles
};
