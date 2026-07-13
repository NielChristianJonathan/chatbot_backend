const { AppError } = require("../utils/appError");
const { verifyRefreshToken } = require("../utils/jwt");

const validationRefreshToken = (req, res, next) => {
    try{
        const refreshToken = req.cookies.refreshToken;
        const user = verifyRefreshToken(refreshToken);
        if (!user) {
            throw new AppError("Session Timed Out", 410);
        }
        req.user = user;
        next()
    } catch(err) {
        next(err)
    }
}

module.exports = {validationRefreshToken}