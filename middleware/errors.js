const NotFoundErrorHandler = (req, res, next) => {
  res.json(404, { ERROR: 'Page not found.' });
}

const ServerErrorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.json(500, { ERROR: 'Internal server error.' });
}

module.exports = { NotFoundErrorHandler, ServerErrorHandler }