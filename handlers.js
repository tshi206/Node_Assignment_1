const handlers = {

    hello: async data => {

        if (data.method !== "post") return {statusCode : 400};

        // Return a HTTP status code and a payload object in JSON format
        return {
            statusCode : 200,
            payload : {
                "Greetings" : "Hello World",
                "payloadReceived" : data
            }
        };

    },

    notFound: async data => {
        console.log(data);
        return {statusCode : 404};
    }

};

module.exports = handlers;