const { AppError } = require("../utils/appError")


const handleError = (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message
        })
    }
    return res.status(500).json({
        message: "Kesalahan Sistem"
    })
}

module.exports= {handleError}