/**
 * Get paginated data from MongoDB model
 * @param {Model} model - Mongoose model
 * @param {Object} filter - MongoDB filter object
 * @param {Object} options - Pagination options
 */
const getPaginationData = async (model, filter = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
    populate = null,
    select = null
  } = options;

  const skip = (page - 1) * limit;

  // Build query
  let query = model.find(filter);

  // Apply select
  if (select) {
    query = query.select(select);
  }

  // Apply populate
  if (populate) {
    query = query.populate(populate);
  }

  // Apply sort
  query = query.sort(sort);

  // Execute query with pagination
  const [data, total] = await Promise.all([
    query.skip(skip).limit(limit).exec(),
    model.countDocuments(filter)
  ]);

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNext,
      hasPrev,
      nextPage: hasNext ? page + 1 : null,
      prevPage: hasPrev ? page - 1 : null,
    }
  };
};

/**
 * Generate pagination links for API responses
 * @param {Object} req - Express request object
 * @param {Object} pagination - Pagination data
 */
const generatePaginationLinks = (req, pagination) => {
  const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
  const query = { ...req.query };

  const links = {};

  // First page
  if (pagination.currentPage > 1) {
    query.page = 1;
    links.first = `${baseUrl}?${new URLSearchParams(query)}`;
  }

  // Previous page
  if (pagination.hasPrev) {
    query.page = pagination.prevPage;
    links.prev = `${baseUrl}?${new URLSearchParams(query)}`;
  }

  // Current page
  query.page = pagination.currentPage;
  links.self = `${baseUrl}?${new URLSearchParams(query)}`;

  // Next page
  if (pagination.hasNext) {
    query.page = pagination.nextPage;
    links.next = `${baseUrl}?${new URLSearchParams(query)}`;
  }

  // Last page
  if (pagination.currentPage < pagination.totalPages) {
    query.page = pagination.totalPages;
    links.last = `${baseUrl}?${new URLSearchParams(query)}`;
  }

  return links;
};

/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 */
const validatePaginationParams = (page, limit) => {
  const validatedPage = Math.max(1, parseInt(page) || 1);
  const validatedLimit = Math.min(Math.max(1, parseInt(limit) || 10), 100); // Max 100 items per page

  return {
    page: validatedPage,
    limit: validatedLimit
  };
};

/**
 * Create pagination metadata for response
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 */
const createPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNext,
    hasPrev,
    nextPage: hasNext ? page + 1 : null,
    prevPage: hasPrev ? page - 1 : null,
    startIndex: (page - 1) * limit + 1,
    endIndex: Math.min(page * limit, total)
  };
};

module.exports = {
  getPaginationData,
  generatePaginationLinks,
  validatePaginationParams,
  createPaginationMeta,
};