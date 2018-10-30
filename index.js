const http = require("http");
const url = require("url");
const StringDecoder = require('string_decoder').StringDecoder;
const router = require("./routes");
const notFound = require("./handlers").notFound;
const config = require("./config");

const server = async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, "");
    const queryStringObject = parsedUrl.query;
    const method = req.method.toLowerCase();
    const headers = req.headers;
    const decoder = new StringDecoder("utf-8");
    let buffer = "";
    req.on("data", data => {
        buffer += decoder.write(data);
    });
    const inputStreamFinished = new Promise(resolve => {
        req.on("end", () => {
            buffer += decoder.end();
            resolve(buffer);
        });
    });
    const requestPayload = await inputStreamFinished;
    const chosenHandler = Object.keys(router).includes(trimmedPath) ? router[trimmedPath] : notFound;
    const data =  {
        trimmedPath,
        queryStringObject,
        method,
        headers,
        "payload" : requestPayload
    };
    const {statusCode, payload} = await chosenHandler(data);
    const status = typeof(statusCode) === "number" ? statusCode : 200;
    const responsePayload = typeof(payload) === "object" ? payload : {};
    const payloadString = JSON.stringify(responsePayload);
    res.setHeader("Content-Type", "application/json");
    res.writeHead(status);
    res.end(payloadString);
    console.log(`Request received on path: ${trimmedPath} with method: ${method} and with these query string entries[k, v]: \n${Object.entries(queryStringObject).map(value => (`[${value[0]}, ${value[1]}]`))}\n with these headers: {\n${Object.entries(headers).map(value => (`\n"${value[0]}":"${value[1]}"`))}\n\n}\n \nPayload: {\n${requestPayload}\n\n}\n\nResponse Status: ${status}\n\nResponse body:\n${payloadString}\n`);
};

const HTTP_Server = http.createServer(server);

HTTP_Server.listen(config["httpPort"], () => {
    console.log(`Server listening on port ${config["httpPort"]} in ${config["envName"]} mode`);
});
