/**
 * Whisper STT client — stubbed out.
 * This system is configured for alert-only (announce) mode.
 * Speech-to-text transcription is not needed.
 */

/**
 * Always returns empty string — STT is not configured.
 * @returns {Promise<string>}
 */
async function transcribe(_audioBuffer, _options) {
  return '';
}

/**
 * Always returns false — no STT backend configured.
 * @returns {boolean}
 */
function isAvailable() {
  return false;
}

module.exports = {
  transcribe,
  isAvailable
};
