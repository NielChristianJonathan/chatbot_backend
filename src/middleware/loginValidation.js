const { AppError } = require("../utils/appError");

const loginValidation = (req, res, next) => {
    try {
        const {username, password} = req.body;
        if (!username.trim() || !password.trim()) {
            throw new AppError("Masukkan Username dan Password")
        }
        next()
    } catch(err) {
        next(err)
    }
}

module.exports = {loginValidation}