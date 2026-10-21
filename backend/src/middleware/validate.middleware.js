import { ApiError } from '../utils/apiError.js';
import { MESSAGES } from '../constants/messages.js';

/**
 * Zod validation middleware for Express
 * Supports either:
 *  - validate(schema, 'body' | 'query' | 'params')
 *  - validate(schema) where schema shapes { body?, query?, params? }
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body'|'query'|'params'|null} source - Target property on req, or null for composite
 */
export const validate = (schema, source = null) => async (req, res, next) => {
  try {
    if (source && (source === 'body' || source === 'query' || source === 'params')) {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      return next();
    }

    // Composite schema validation ({ body?, query?, params? })
    const target = {};
    if (req.body && Object.keys(req.body).length > 0) target.body = req.body;
    if (req.query && Object.keys(req.query).length > 0) target.query = req.query;
    if (req.params && Object.keys(req.params).length > 0) target.params = req.params;

    // If schema defines body/query/params shapes
    if (schema.shape && (schema.shape.body || schema.shape.query || schema.shape.params)) {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;
      return next();
    }

    // Default fallback to body
    const parsed = await schema.parseAsync(req.body);
    req.body = parsed;
    return next();
  } catch (error) {
    // If it's a ZodError, format it nicely for ApiError
    if (error.name === 'ZodError' || Array.isArray(error.issues)) {
      const formattedErrors = (error.issues || []).map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(ApiError.badRequest(MESSAGES.VALIDATION_ERROR, formattedErrors));
    }
    return next(error);
  }
};

export default validate;
