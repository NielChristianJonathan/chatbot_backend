const getTools = ({key, name, description, properties, handler}) => {
    return (
        {
            key: key,
            tool: {
                type: "function",
                function: {
                    name: name,
                    description: description,
                    parameters: {
                        type: "object",
                        properties: properties,
                        required: []
                    },
                },
                handler: handler
            }
        }
    )
}

module.exports = {getTools}