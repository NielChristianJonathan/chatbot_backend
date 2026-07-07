const bcrypt = require("bcrypt")
const { getPassUser, getUsername, inputUser } = require("./pg.services");
const { AppError } = require("../utils/appError");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

const loginService = async (username, password) => {
    try {
        const passDb = await getPassUser(username);
        const checkPass = await bcrypt.compare(password, passDb[0].password);
        if (!checkPass) {
            throw new AppError("Password Salah", 400)
        }
        console.log(checkPass)
        const accessToken = generateAccessToken(username);
        console.log("++++++++++++++Access Token++++++++++++++++");
        console.log(accessToken);
        console.log("++++++++++++++++++++++++++++++");
        const refreshToken = generateRefreshToken(username)
        console.log(refreshToken);
        return ({
            refreshToken,
            accessToken
        })
    } catch(err) {
        console.log(err)
    }
}

const registerService = async (username, email, password) => {
    try {
        const isUsernameExist = await getUsername(username);
        console.log(isUsernameExist)
        if (isUsernameExist) {
            throw new AppError("Username sudah digunakan", 400)
        };
        const hashedPassword = await bcrypt.hash(password, 10);
        await inputUser(username, hashedPassword);
        console.log("Berhasil register")
        return username
    } catch(err) {
        throw new AppError(err, 400)
    }
}

module.exports = {loginService, registerService}