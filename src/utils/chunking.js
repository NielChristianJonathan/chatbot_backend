require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })
const crypto = require("crypto");

const fs = require("fs");

const path = require("path")

const docPath = path.join(__dirname, "../doc")
console.log(docPath)

// const documents = fs.readdirSync(docPath)

// console.log(documents)

// [{filename: string, hash: string, content: string}, ...]
const getAllDocs = () => {
    const documents = fs.readdirSync(docPath).map(val => {
        const content =String(fs.readFileSync(path.join(docPath, val)))
        return ({
            filename: val,
            hash : crypto.createHash("sha256").update(content).digest("hex"),
            content: content
        })
    })

    return documents   
}


// [{filename:string, chunking: list of string}, ...]
const chunkAllDocs = () => {
    const documents = getAllDocs()
    const chunkFiles = [] // [{filename:..., chunking: [..., ...]}, ...]
    for (const file of documents) {
        let filename = file.filename;
        let content = file.content;
        let hash = file.hash;

        if (filename === "aturan_bisnis.md" || filename === "faq_praya.md") {
            const chunk_content = content.split(/[##%$#]/).filter((val, i) => val);
            const chunk_arr = [];
            chunk_content.map((val, i) => {
                chunk_arr.push({chunk_content: val, chunk_idx: i})
            });
            chunkFiles.push({ filename: filename, hash: hash, chunking: chunk_arr, content: content })
        } else {
            const chunk_content = content.split(/##/).filter((val, i) => val);
            const chunk_arr = [];
            chunk_content.map((val, i) => {
                chunk_arr.push({chunk_content: val, chunk_idx: i})
            });
            chunkFiles.push({ filename: filename, hash: hash, chunking: chunk_arr, content: content })
        }
    }
    return chunkFiles
}

// chunkings = chunkAllDocs()
// console.log(chunkings[1])
const getAturan =  () => {
    const aturan_bisnis = String(fs.readFileSync("./backend/src/doc/aturan_bisnis.md", "utf8"));
    const chunk_bisnis = aturan_bisnis.split(/[##%$#]/).filter((val, i) => val);
    const chunks_arr = [];
    chunk_bisnis.map((val, i) => {
        // const key = val.split(/[\n]/).filter((val, i) => i === 0);
        // const context = val.split(/[\n]/).filter((context, i) => i !== 0).filter((item) => item);
        chunks_arr.push({context:val})
    })
    // console.log(`chunks: ${chunks_arr}`)
    
    return chunks_arr
}

const getFaqPraya = () => {
    const faq_praya = String(fs.readFileSync("./backend/src/doc/faq_praya.md", "utf8"));
    const chunk_faq_praya = faq_praya.split(/[##%$#]/).filter((val, i) => val);
    chunks_arr = [];
    chunk_faq_praya.map((val) => {
        chunks_arr.push({context:val})
    })

    return chunks_arr
}


const getSchemaPraya = () => {
    const aturan_bisnis = String(fs.readFileSync("./backend/src/doc/schema_praya.md", "utf8"));
    const chunk_bisnis = aturan_bisnis.split(/##/).filter((val, i) => val);
    // console.log(chunk_bisnis)

    const chunks_arr = [];
    chunk_bisnis.map((val, i) => {
        // const key = val.split(/[\n]/).filter((val, i) => i === 0);
        // const context = val.split(/[\n]/).filter((context, i) => i !== 0).filter((item) => item);
        chunks_arr.push({context:val})
    })
    // console.log(`chunks: ${chunks_arr}`)
    
    return chunks_arr
}


module.exports = { getAturan, getFaqPraya, getSchemaPraya, getAllDocs, chunkAllDocs }