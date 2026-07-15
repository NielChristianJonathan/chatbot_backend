const { getRemainingToken } = require("../services/pg.services");
const { AppError } = require("../utils/appError");
const { getHistory } = require("../utils/cache");
const { tokenized, concate } = require("../utils/tokenizer");
const { BASE_PROMPT } = require("../utils/tools/generic");


const checkToken = async(req, res, next) => {
    try {
        console.log("haloo")
        const {username, terminalAccess} = req.user;
        const {accessToken} = req.cookies;
        const remaining_token = getRemainingToken({username});
        const history = await getHistory({accessToken});
        const base_prompt = BASE_PROMPT(terminalAccess);
        const userMessage = req.body.message
        const message = concate({userMessage, history, base_prompt});
        const estimatedTokenUse = await tokenized({message})
        console.log(estimatedTokenUse)

        if (remaining_token < estimatedTokenUse) {
            console.log("gagal")
            throw new AppError(`Token Melebihi batas`, 429)
        }

        next()
    } catch(err) {
        console.log(err)
        throw err
    }
}

module.exports = {checkToken}