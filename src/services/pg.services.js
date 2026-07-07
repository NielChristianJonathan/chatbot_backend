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


const getPassUser = async (username) => {
    try {
        const result = await poolPg.query(`
            SELECT password FROM users WHERE username = $1
            `, [username]
        );
        return result.rows
    } catch {
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
        await poolPg.query(`
            INSERT INTO users (username, password)
            VALUES ($1, $2)
            `, [username, hashPass]
        );
        console.log("User berhasil dimasukan")
    } catch {
        throw new AppError("Database Failed", 500)
    }
}

module.exports = { search_nearest_vector, input_data, getPassUser, getUsername, inputUser }