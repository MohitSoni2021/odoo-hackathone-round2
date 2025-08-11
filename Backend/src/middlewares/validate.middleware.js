const { validationResult } = require('express-validator');
const { sendErrorResponse } = require('../utils/response');

/**
 * Middleware to handle validation results from express-validator
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    return sendErrorResponse(res, 'Validation failed', 400, { errors: errorMessages });
  }

  next();
};

/**
 * Wrapper function to combine validation rules with error handling
 * @param {Array} validations - Array of express-validator validation chains
 */
const validate = (validations) => {
  return [
    ...validations,
    handleValidationErrors,
  ];
};

module.exports = {
  validate,
  handleValidationErrors,
};