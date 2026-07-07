const { AppError } = require("../utils/appError");
const { verifyAccessToken } = require("../utils/jwt");

const validationAccessToken = (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        const result = verifyAccessToken(accessToken);
        if (!result) {
            throw err
        }
        console.log("==========================")
        console.log("Access Token")
        console.log(result);
        console.log("==========================")
        next();
    } catch(err)  {
        throw new AppError("Unauthorized", 401)
    }
}

module.exports = { validationAccessToken }