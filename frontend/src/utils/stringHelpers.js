/**
 * Estimate reading time in minutes
 * @param {string} text
 * @returns {number} minutes
 */
export const estimateReadingTime = (text) => {
  if (!text) return 1;
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes > 0 ? minutes : 1;
};

/**
 * Truncate text cleanly to a maximum length
 * @param {string} text
 * @param {number} length
 * @returns {string}
 */
export const truncate = (text, length = 160) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return `${text.substring(0, length).trim()}...`;
};

export default {
  estimateReadingTime,
  truncate,
};
