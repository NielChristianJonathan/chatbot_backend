const { planUpgradeService } = require("../services/plan.services")

const planUpgradeController = async(req, res, next) => {
    console.log(req.body)
    const {username, newPlan} = req.body;
    const result = await planUpgradeService({username, newPlan});
    return res.ok(result);
}

module.exports = {planUpgradeController}