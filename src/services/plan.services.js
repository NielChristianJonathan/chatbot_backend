const { upgradePlan } = require("./pg.services")

const planUpgradeService = async ({username, newPlan}) => {
    await upgradePlan({username, newPlan})
    return ({username, newPlan})
}

module.exports = {planUpgradeService}