const paginate = async (Model, page = 1, limit = 5, query = {}) => {
  page = parseInt(page);

  const totalDocuments = await Model.countDocuments(query);
  const totalPages = Math.ceil(totalDocuments / limit);

  // Clamp page number
  if (page > totalPages) page = totalPages;
  if (page < 1) page = 1;

  const skip = (page - 1) * limit;

  const data = await Model.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    data,
    meta: {
      page,
      limit,
      totalDocuments,
      totalPages,
    },
  };
};

export default paginate;