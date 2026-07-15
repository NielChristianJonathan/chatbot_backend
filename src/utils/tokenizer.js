const { AutoTokenizer } = require('@huggingface/transformers');

const concate = ({userMessage, history, base_prompt}) => {
    let message = ``;
    message += userMessage + base_prompt
    history.map(item => message += item.content)
    return message
}

const tokenized = async({message}) => {
    const tokenizer = await AutoTokenizer.from_pretrained("Qwen/Qwen2.5-7B");
    const tokens = await tokenizer.encode(message);
    return tokens.length
}

module.exports = {concate, tokenized}