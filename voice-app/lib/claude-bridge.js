/**
 * Claude Bridge — stubbed out.
 * This system is configured for alert-only (announce) mode.
 * No AI/LLM backend is required.
 */

/**
 * No-op: AI queries are not used in alert-only mode.
 * @returns {Promise<string>}
 */
async function query(_prompt, _options) {
  return 'This is an automated alert system. No AI responses are configured.';
}

/**
 * No-op: no session to clean up.
 */
async function endSession(_callId) {
  // nothing to do
}

/**
 * Always returns false — no AI backend configured.
 * @returns {Promise<boolean>}
 */
async function isAvailable() {
  return false;
}

module.exports = {
  query,
  endSession,
  isAvailable
};
