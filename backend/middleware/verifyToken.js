// ← GUARD 1: "Are you logged in?"
// The frontend sends the token in a header:  Authorization: Bearer <token>
// If the token is good, we save who the user is on req.user and call next().

import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
    // 1. read the header
    const header = req.headers.authorization;

    // 2. no header, or it does not start with "Bearer " -> stop here
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token, access denied" });
    }

    // 3. "Bearer abc123" -> split at the space and take the second part
    const token = header.split(" ")[1];

    try {
        // 4. check the secret stamp and read what is inside the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5. save it on req so the next guard and the controller can use it
        req.user = decoded; // { id, role }

        next(); // let the request go through
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

export default verifyToken;
