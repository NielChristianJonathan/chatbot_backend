const bcrypt = require("bcrypt")
const { getDataUser, getUsername, inputUser, getTerminalCode } = require("./pg.services");
const { AppError } = require("../utils/appError");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

const loginService = async (username, password) => {
    try {
        const user = await getDataUser(username);
        if(!user) throw new AppError('User tidak ditemukan!', 400);

        const terminal_code = user.terminal_code || "";
        const passDb = user.password;
        const checkPass = await bcrypt.compare(password, passDb);
        if (!checkPass) {
            throw new AppError("Password Salah", 400)
        }
        const accessToken = generateAccessToken({username, terminalCode: terminal_code});
        const refreshToken = generateRefreshToken({username, terminalCode: terminal_code});
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