const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const tokenSecret = process.env.TOKEN_SECRET;

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

	if (!authHeader) return res.status(401).json({msg: "Access Denied"})
    const token = authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ msg: "Access Denied" });
    }

    try {
        const user = jwt.verify(token, tokenSecret);
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ msg: "Invalid token" });
    }
};

module.exports = authMiddleware;
