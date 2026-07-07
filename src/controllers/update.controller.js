const { addKnowledgeService } = require("../services/update.service")

const addKnowledgeController = async (req, res, next) => {
    try {
        const knowledge = req.body.knowledge
        result = await addKnowledgeService(knowledge)
        res.json({result})
    } catch(err) {
        throw err
    }
}

module.exports = {addKnowledgeController}