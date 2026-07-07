const { AppError } = require("../utils/appError");

const registerValidation = (req, res, next) => {
    try {
        const {username, email, password, confirmPassword} = req.body;
        if (!username.trim() || !email.trim() || !password.trim()|| !confirmPassword.trim()) {
            throw new AppError("Tolong masukan data", 402);
        }
        if (password.trim() !== confirmPassword.trim()) {
            throw new AppError("Password Salah", 402);
        }
        next();
    } catch(err) {
        next(err)
    }
}

module.exports = {registerValidation}