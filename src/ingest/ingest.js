require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })
const crypto = require("crypto")
const { poolPg } = require("../config/supabase");
const { ollamaEmbed } = require("../services/chatbot.service");
const { input_data } = require("../services/pg.services");
const { chunkAllDocs } = require("../utils/chunking");


const cekUpdate = async () => {
    try {
        const documents = chunkAllDocs()
        for (const file of documents) {
            const filename = file.filename;
            const hash = file.hash;
            const result = await poolPg.query(`
                select filename, hash from HashDocument where filename = $1
                `, [filename])

            // Belum ada file di database
            if (result.rows.length  <= 0 ) {
                console.log("Belum ada data di database")
                console.log("Memasukan data...")
                const insertFile = poolPg.query(`
                    INSERT INTO HashDocument (
                        filename,
                        hash    
                    )
                    VALUES ($1, $2)
                    `, [filename, hash]
                );
                console.log("File berhasil dimasukkan");

                for ( const chunk of file.chunking) {
                    console.log("Embedding...")
                    const chunkContent = chunk.chunk_content;
                    const chunkIdx = chunk.chunk_idx;
                    const embedChunk = await ollamaEmbed(chunk.chunk_content)
                    const vector_string = `[${embedChunk.join(", ")}]`
                    const insertEmbedChunk = await poolPg.query(`
                        INSERT INTO documents (
                            chunk_idx,
                            filename,
                            content, 
                            embedding
                        ) VALUES ($1, $2, $3, $4)
                        `, [chunkIdx, filename, chunkContent, vector_string]
                    );
                    console.log("Embedding berhasil")
                }
                console.log(`Database Diperbaharui`)
            } else {
                const hashDatabase = result.rows[0].hash;
                if (hash === hashDatabase) {
                    console.log(`tidak ada perubahan pada file ${filename}`)
                } else {
                    console.log(`terdapat perubahan pada file ${filename}`)
                    const updateHash = await poolPg.query(`
                            UPDATE HashDocument
                            SET hash = $1
                            WHERE filename = $2
                        `, [hash, filename]
                    );
                    console.log("Hash diperbaharui")
                    console.log("Menghapus data...")
                    const delData = await poolPg.query(`
                        DELETE FROM documents 
                        WHERE filename = $1
                        `, [filename]
                    );
                    console.log(`${delData.rowCount} baris telah dihapus`)

                    console.log("Mengupdate data...")
                    for ( const chunk of file.chunking) {
                        const chunkContent = chunk.chunk_content;
                        const chunkIdx = chunk.chunk_idx;
                        const embedChunk = await ollamaEmbed(chunk.chunk_content)
                        const vector_string = `[${embedChunk.join(", ")}]`
                        const insertEmbedChunk = await poolPg.query(`
                            INSERT INTO documents (
                                chunk_idx,
                                filename,
                                content, 
                                embedding
                            ) VALUES ($1, $2, $3, $4)
                            `, [chunkIdx, filename, chunkContent, vector_string]
                        );
                        
                    }
                    console.log(`Data ${filename} berhasil diperbaharui`);
                }
            }
        }
    } catch(err) {
        console.log(err)
    }
}

cekUpdate()
