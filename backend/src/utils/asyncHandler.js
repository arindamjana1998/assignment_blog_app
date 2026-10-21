/**
 * Higher-order function that catches async errors and passes them to next()
 * @param {Function} fn - Express route handler / controller function
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
