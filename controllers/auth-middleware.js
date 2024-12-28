const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from Bearer token

    if (!token) {
        return res.status(401).json({ message: "Token not provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }

        req.user = user; // Save the decoded user in the request for use in other endpoints
        next();
    });
};

module.exports = authenticateToken;