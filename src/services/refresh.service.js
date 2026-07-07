const { generateAccessToken } = require("../utils/jwt")

const refreshAccessService = (username) => {
    try {
        const accessToken = generateAccessToken(username);
        return ({accessToken})
    } catch(err) {
        next(err)
    }
}

module.exports = {refreshAccessService}