const bcrypt = require("bcrypt")
const { getDataUser, getUsername, inputUser, getTerminalCode, getPlan } = require("./pg.services");
const { AppError } = require("../utils/appError");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

const loginService = async (username, password) => {
    try {
        const user = await getDataUser(username);
        if(!user) throw new AppError('User tidak ditemukan!', 400);
        console.log(user)
        const terminal_code = user.tml_cd || "_";
        const passDb = user.password;
        const checkPass = await bcrypt.compare(password, passDb);
        if (!checkPass) {
            throw new AppError("Password Salah", 400)
        }
        delete user.password;
        user.accessToken = generateAccessToken({username, terminalCode: terminal_code});
        user.refreshToken = generateRefreshToken({username, terminalCode: terminal_code});
        const plan = await getPlan()
        console.log('==============================')
        console.log(plan)
        console.log('==============================')
        
        return (user)
    } catch(err) {
        throw err
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