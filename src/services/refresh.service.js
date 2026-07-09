const { generateAccessToken } = require("../utils/jwt")

const refreshAccessService = (username, terminalCode) => {
    try {
        const accessToken = generateAccessToken({username, terminalCode});
        return ({accessToken})
    } catch(err) {
        next(err)
    }
}

module.exports = {refreshAccessService}