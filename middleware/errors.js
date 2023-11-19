const NotFoundErrorHandler = (req, res, next) => {
  res.status(404).json(404, { ERROR: 'Page not found.' });
}

const ServerErrorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(500, { ERROR: 'Internal server error.' });
}

module.exports = { NotFoundErrorHandler, ServerErrorHandler }