import { ApiError } from '../utils/apiError.js';

export const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl} - Route not found on this server`));
};

export default notFoundHandler;
