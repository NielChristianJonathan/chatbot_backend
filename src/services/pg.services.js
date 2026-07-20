const { poolPg } = require("../config/supabase");
const { AppError } = require("../utils/appError");


const search_nearest_vector = async (userEmbed) => {
    try {
        // console.log(userEmbed);
        vector_string = `[${userEmbed.join(", ")}]`
        result = await poolPg.query(`
            SELECT 
                id, 
                content, 
                embedding <=> $1::vector AS distance
            FROM documents
            ORDER BY distance
            LIMIT 1
            ;
        `, [vector_string])
        return result.rows.map((val) => val.content).join()

    } catch(err) {
        console.error(err);
    }
}

const input_data = async (content, embedding) => {
    try {
        console.log(embedding)
        vector_string = `[${embedding.join(", ")}]`
        // console.log(vector_string)
        await poolPg.query(`
            INSERT INTO documents (content, embedding)
                VALUES ($1, $2)
        `, [content, vector_string]);
        const result = pool_pg.query(`
            SELECT * FROM documents
        `);
        console.log("berhasil");
        console.log((await result).rows);
    } catch (err) {
        console.error(err);
    }
}


const getDataUser = async (username) => {
    try {
        const result = await poolPg.query(`
            select 
                u.username,
                u.password,
                u.tml_cd,
                u.tml_nm,
                u.reset_date,
                u.remaining_tokens,
                u.plan_date,
                t.plan
            from users u
            join token t on u.plan_id = t.id
            where u.username = $1
            `, [username]
        );
        return result.rows[0]
    } catch(err) {
        console.log(err)
        throw new AppError("Failed Database", 500)
    }
}

const getUsername = async (username) => {
    try{
        const result = await poolPg.query(`
            SELECT * FROM users where username = $1
            `, [username]
        );
        return result.rows.length > 0;

    } catch {
        throw new AppError("Failed Database", 500)
    }
}

const inputUser = async (username, hashPass) => {
    try {
        console.log("Masuk")
        await poolPg.query(`
            INSERT INTO users (username, password, plan_id)
            VALUES ($1, $2, 1)
            `, [username, hashPass]
        );
        console.log("User berhasil dimasukan")
    } catch(err) {
        console.log(err)
        throw new AppError("Database Failed", 500)
    }
}

const getTerminalCode = async (username) => {
    try {
    const result = await poolPg.query(`
            SELECT * FROM users where username = $1
            `, [username]
        );
        return result.rows
    } catch {
        throw new AppError("Failed Database", 500)
    }
}

const inputMessage = async({sessionId, username, role, context, tools = null, tool_result = null, rag = null, prompt_eval_count = null, eval_count = null, totalToken = null}) => {
    try {
        console.log(`SessionId:`, sessionId)
        console.log(`username:`, username)
        console.log(`role:`, role)
        console.log(`context:`, context)
        console.log(`tools:`, tools)
        console.log(`tool_result:`, tool_result)
        console.log(`rag:`, rag)
        console.log(`prompt_eval_count:`, prompt_eval_count)
        console.log(`eval_count:`, eval_count)
        console.log(`totalToken:`, totalToken)
        await poolPg.query(`
            INSERT INTO messages (chatsession, username, role, context, tools, tool_result, rag, prompt_eval_count, eval_count, total_token)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `, [sessionId, username, role, context, tools, tool_result, rag, prompt_eval_count, eval_count, totalToken]
        );
        console.log("Message berhasil dimasukkan")
    } catch(err) {
        console.log(err);
        
        throw new AppError("Failed Database", 500)
    }
}

const updateDate = async({username}) => {
    try {
        const result = await poolPg.query(`
            select 
                reset_date <= now() - interval '24 hours' as need_reset
            from users
            where username = $1
            `, [username]
        );
        const need_reset = result.rows[0].need_reset
        if (need_reset) {
            await poolPg.query(`
                update users u
                    set 
                        reset_date = now(),
                        remaining_tokens = t.max_token
                from token t
                where t.id = u.plan_id 
                and u.username = $1
                `, [username]
            )
            console.log(`Date has been reset`)
        }
        console.log("Reset date not updated.");
    } catch {
        throw new AppError("Failed Database", 500)
    }
}

const getRemainingToken = async({username}) => {
    try {
        const result = await poolPg.query(`
            select
                remaining_tokens
            from users
            where username = $1
            `, [username]
        )
        const remaining_token = result.rows[0].remaining_tokens
        console.log(remaining_token)
        return remaining_token
    } catch {
        throw new AppError("Failed Database", 500)
    }
}

const minusToken = async({totalToken, username}) => {
    await poolPg.query(`
        update users
            set remaining_tokens = remaining_tokens - $1
        where username = $2
        `, [totalToken, username]
    )
}

const addKeyMessages = async ({username, chatSession, userMessage}) => {
    try {
        console.log(username)
        console.log(chatSession)
        console.log(userMessage)
        await poolPg.query(`
            INSERT INTO keymessages (chatSession, username, title, createDate)
            VALUES ($1, $2, $3, now())
            `, [chatSession, username, userMessage]
        )
        console.log("Key Berhasil dimasukkan")
    } catch (error) {
        console.log(error)
        throw new AppError("Failed Database", 500)
    }
}

const getKeyMessage = async ({username}) => {
    try {
        result = await poolPg.query(`
            select chatsession, title, createdate from keymessages
            where username = $1;
            `, [username]
        )
        return result.rows
    } catch (error) {
        throw new AppError("Failed Database", 500)
    }
}

const getMessage = async ({username, chatSession}) => {
    try {
        const result = await poolPg.query(`
            select 
                chatsession, username, role, context as content
            from messages 
            where username = $1 
            and chatsession = $2
            `, [username, chatSession]
        )
        return result.rows
    } catch (error) {
        throw new AppError("Failed Database", 500)
    }
}

const getPlan = async () => {
    try {
        const result = await poolPg.query(`
            select * from token where status = 'Y'
            `, 
        )
        return result
    } catch (error) {
        throw new AppError("Failed Database", 500)
    }
}
module.exports = { search_nearest_vector, input_data, getDataUser, getUsername, inputUser, getTerminalCode, inputMessage, updateDate, getRemainingToken, minusToken, addKeyMessages, getKeyMessage, getMessage, getPlan }