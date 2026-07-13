const { sequelize } = require("../config/oracle")

const getTerminalAccess = async (terminalCode) => {
    const [result] = await sequelize.query(`
        SELECT 
            TML_CD  AS TERMINAL_CODE
            , TML_NM AS TERMINAL_NAME
        FROM M_TERMINAL 
        WHERE 1 = 1
            AND (:terminalCode IS NULL OR UPPER(TML_CD) = UPPER(:terminalCode));
        `,
        {
            bind: {
                terminalCode: terminalCode
            }
        }
    );
    return result
}

const getTerminalCode = async (terminalName) => {
    const [result] = await sequelize.query(`
        SELECT 
            TML_CD AS TERMINAL_CODE
        FROM M_TERMINAL
        WHERE 1 = 1
            AND (:terminalName IS NULL OR UPPER(TML_NM) = UPPER(:terminalName))
        `,
        {
            bind: {
                terminalName: terminalName
            }
        }
    )
}
module.exports = {getTerminalAccess, getTerminalCode}