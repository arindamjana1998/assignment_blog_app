import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

export class ApiResponse {
  /**
   * Unified API Success Response formatter
   * @param {number} statusCode - HTTP status code (200, 201, etc.)
   * @param {string} message - Human-readable success message
   * @param {*} data - Response payload
   * @param {object|null} pagination - Optional pagination metadata
   */
  constructor(statusCode = HTTP_STATUS.OK, message = 'Success', data = null, pagination = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== null) {
      this.data = data;
    }
    if (pagination) {
      this.pagination = pagination;
    }
  }

  static success(res, message = 'Success', data = null, statusCode = HTTP_STATUS.OK) {
    return res.status(statusCode).json(new ApiResponse(statusCode, message, data));
  }

  static created(res, message = 'Created successfully', data = null) {
    return res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, message, data));
  }

  static paginated(res, message = 'Success', data = [], pagination = {}, statusCode = HTTP_STATUS.OK) {
    return res.status(statusCode).json(new ApiResponse(statusCode, message, data, pagination));
  }
}

export default ApiResponse;
