const { getTerminalAccess } = require("../repositories/terminal");
const { AppError } = require("../utils/appError");
const { verifyAccessToken } = require("../utils/jwt");

const validationAccessToken = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        const result = verifyAccessToken(accessToken);
        if (!result) {
            throw err
        }
        const terminalAccess = await getTerminalAccess(result.terminalCode)

        req.user = result;
        req.user.terminalAccess = terminalAccess
        next();
    } catch(err)  {
        throw new AppError("Unauthorized", 401)
    }
}

module.exports = { validationAccessToken }