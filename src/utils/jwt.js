const jwt = require("jsonwebtoken");
const { JWT_SECRET_TOKEN } = require("../constant/env");
const generateAccessToken = (username) => {
    return jwt.sign(
        {
            username
        },
        JWT_SECRET_TOKEN,
        {
            expiresIn: "15m"
        }
    )
}

const generateRefreshToken = (username) => {
    return jwt.sign(
        {
            username
        },
        JWT_SECRET_TOKEN,
        {
            expiresIn: "7d"
        }
    )
}

const verifyAccessToken = (accessToken) => {
    return jwt.verify(
        accessToken,
        JWT_SECRET_TOKEN
    )
}
const verifyRefreshToken = (refreshToken) => {
    return jwt.verify(
        refreshToken,
        JWT_SECRET_TOKEN
    )
}

module.exports = {generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken}