const getKeyMessageController = async(req, res, next) => {
    try {
        const {username} = req.user;
        console.log(username)
        res.ok(req.user);
    } catch(err) {
        console.log(err);
        throw err
    }
}

module.exports = {getKeyMessageController}