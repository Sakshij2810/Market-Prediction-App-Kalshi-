import jwt from "jsonwebtoken";

export const auth = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .satatus(401)
        .json({ success: false, message: "Access denied. Token missing." });
    }
    // 2. Extract token
    const token = authHeader.split(" ")[1];

    // 3. verfiy token
    let decoded = jwt.verify(token, process.env.JWT_SECRETE);

    // 4. Attach user info to request
    req.user = decoded;

    // 5. Continue to next middleware/controller
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
};
