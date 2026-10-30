// ← GUARD 2: "Are you the admin?"
// Always runs AFTER verifyToken, because verifyToken puts the role on req.user.
// 401 = "I don't know who you are"   403 = "I know who you are, but you can't do this"

const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin only" });
    }
    next();
};

export default isAdmin;
