const { refreshAccessService } = require("../services/refresh.service");
const { AppError } = require("../utils/appError");

const refreshAccessController = async(req, res, next) => {
    try {
        const {username, terminalCode} = req.user;

        console.log(username)
        const result = refreshAccessService(username, terminalCode);
        const accessToken = result.accessToken;
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            maxAge: 60 * 15 * 1000,
            sameSite: "lax",
            secure: false
        });
        res.json({username})
    } catch {
        next(err)
    }
}

module.exports = {refreshAccessController}