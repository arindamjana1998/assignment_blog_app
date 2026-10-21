/**
 * Extract human-readable error message from backend ApiError envelope or network failure
 * @param {Error|object} error - Axios error object
 * @returns {string} Clean error message
 */
export const getErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred. Please try again.';

  // If server responded with our standard ApiError envelope
  if (error.response?.data) {
    const data = error.response.data;

    // 1. If detailed field validation errors exist, format them
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const fieldErrors = data.errors
        .map((err) => (err.field ? `${err.field}: ${err.message}` : err.message))
        .join(', ');
      return fieldErrors || data.message || 'Validation error';
    }

    // 2. Main error message from server
    if (data.message) {
      return data.message;
    }
  }

  // Handle HTTP status code fallbacks
  if (error.response?.status) {
    const status = error.response.status;
    if (status === 400) return 'Bad request. Please verify your input.';
    if (status === 401) return 'Session expired or unauthorized. Please log in.';
    if (status === 403) return 'You do not have permission to perform this action.';
    if (status === 404) return 'The requested resource was not found.';
    if (status === 409) return 'A conflict occurred with existing data.';
    if (status === 429) return 'Too many requests. Please slow down and try again.';
    if (status >= 500) return 'Server error. Our team has been notified.';
  }

  // Network offline / connection refused
  if (error.message === 'Network Error' || !error.response) {
    return 'Unable to connect to the server. Please check your internet connection or verify the backend is running.';
  }

  return error.message || 'An unexpected error occurred.';
};

export default getErrorMessage;
