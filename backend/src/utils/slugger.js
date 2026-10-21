import slugify from 'slugify';
import crypto from 'crypto';

/**
 * Generate a URL-friendly slug from title
 * @param {string} text - Title or raw text string
 * @returns {string} Sanitized slug
 */
export const createSlug = (text) => {
  return slugify(text, {
    lower: true,
    strict: true, // strip characters that replace regex
    trim: true,
    remove: /[*+~.()'"!:@]/g,
  });
};

/**
 * Generate a collision-safe unique slug for a given Mongoose Model
 * @param {import('mongoose').Model} model - Target Mongoose model (e.g., Post)
 * @param {string} title - Post title
 * @param {string|null} currentDocId - ID of current document if updating
 * @returns {Promise<string>} Unique slug
 */
export const generateUniqueSlug = async (model, title, currentDocId = null) => {
  const baseSlug = createSlug(title) || 'post';
  let candidateSlug = baseSlug;
  let isUnique = false;

  // 1. Check if base slug is already free
  const existing = await model.findOne({
    slug: candidateSlug,
    ...(currentDocId ? { _id: { $ne: currentDocId } } : {}),
  });

  if (!existing) {
    return candidateSlug;
  }

  // 2. Resolve collision with short cryptorandom suffix
  while (!isUnique) {
    const randomSuffix = crypto.randomBytes(3).toString('hex'); // 6 alphanumeric characters
    candidateSlug = `${baseSlug}-${randomSuffix}`;

    const check = await model.findOne({
      slug: candidateSlug,
      ...(currentDocId ? { _id: { $ne: currentDocId } } : {}),
    });

    if (!check) {
      isUnique = true;
    }
  }

  return candidateSlug;
};

export default {
  createSlug,
  generateUniqueSlug,
};
