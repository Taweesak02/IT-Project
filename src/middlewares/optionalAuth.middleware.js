const { verifyToken } = require('../utils/jwt');

const optionalAuthenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        req.user = null;
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
    } catch (err) {
        req.user = null;   // invalid/expired token — treat as anonymous, don't block
    }

    next();
};

module.exports = optionalAuthenticate;