const { loginService, registerService } = require("../services/auth.service");

const loginController = async (req, res, next) => {
    try {
        const {username, password} = req.body;
        const result = await loginService(username, password);
        const {accessToken, refreshToken} = result;
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            maxAge: 60 * 15 * 1000,
            sameSite: "lax",
            secure: false
        })
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 7 * 60 * 60 * 24 * 1000,
            sameSite: "lax",
            secure: false
        })
        console.log("berhasil")
        
        res.ok({accessToken, refreshToken, username})
    } catch(err) {
        next(err)
    }
}

const registerController = async (req, res, next) => {
    try {
        const {username, email, password} = req.body;
        console.log(username, email, password)
        const result = await registerService(username, email, password)
        res.json("HALOOOOOO")
    } catch(err) {
        next(err)
    }
}

const refreshController = async (req, res, next) => {
    try {
        res.json("heheeee")
    } catch(err) {
        next(err)
    }
}

module.exports = {loginController, registerController, refreshController}