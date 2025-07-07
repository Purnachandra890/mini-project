  const jwt = require("jsonwebtoken");

  // Replace this with your own secret key and keep it secure
  const JWT_SECRET = process.env.JWT_SECRET || "123456";

  const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // console.log(authHeader)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {

      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // Attach user data (e.g., userId) to the request
      next();
    } catch (err) {
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
  };

  module.exports = authenticateUser;
