async function requireUid(req, res, next) {
  try {
    const { uid } = req.body;

    if (!uid) {
      console.error("UID is missing");
      return res.status(401).send("Unauthorized");
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).send("Unauthorized");
  }
}

module.exports = requireUid;
