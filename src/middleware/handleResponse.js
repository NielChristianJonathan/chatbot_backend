const handlerResponse = (req, res, next) => {
    const send = ({status, success, data}) => {
        res.status(status).json({success, data})
    }

    res.ok = (data) => {
        return send({status: 200, success: true, data})
    };
    next()
}

module.exports = {handlerResponse}