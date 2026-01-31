const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'This Request Is Not Found'
  });
};

module.exports = notFound;