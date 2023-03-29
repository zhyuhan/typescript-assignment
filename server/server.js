const http = require("http");
const {
    v4: uuidv4,
} = require('uuid');


const HOST = "127.0.0.1";
const PORT = 9000;

let clients = [];

function eventsHandler(request, response) {
    response.statusCode = 200;
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("connection", "keep-alive");
    response.setHeader("Content-Type", "text/event-stream");

    const clientId = Date.now();

    const newClient = {
      id: clientId,
      response
    };

    console.log(`${clientId} Connection created`);

    clients.push(newClient);

    sendWithRandomTime(newClient)()

    request.on('close', () => {
        console.log(`${clientId} Connection closed`);
        clients = clients.filter(client => client.id !== clientId);
    });
};

function sendWithRandomTime(client) {
    return function() {
        const min = 1, max = 5;
        const rand = Math.floor(Math.random() * (max - min + 1) + min);

        const newFact = {
            "msg_id": uuidv4(),
            "time": Math.floor(Date.now() / 1000),
            "msg": getRandomText()
         };
        client.response.write(`data: ${JSON.stringify(newFact)}\n\n`)
    
        setTimeout(sendWithRandomTime(client), rand * 1000);
    }
}

function getRandomText() {
    const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lectus vestibulum mattis ullamcorper velit sed ullamcorper. Dui id ornare arcu odio ut sem. Risus ultricies tristique nulla aliquet enim tortor at auctor. Sem nulla pharetra diam sit amet nisl suscipit adipiscing bibendum. Justo nec ultrices dui sapien eget mi proin sed libero. Consequat interdum varius sit amet mattis vulputate. Aliquam nulla facilisi cras fermentum odio eu feugiat pretium nibh. Velit aliquet sagittis id consectetur purus ut faucibus pulvinar elementum."
    
    const min = 1, max = 200;
    const rand = Math.floor(Math.random() * (max - min + 1) + min);

    return text.slice(0,rand)
}

const requestListener = function (req, res) {
    switch (req.url) {
        case "/events":
            eventsHandler(req, res)
            break;
        case "/status":
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({clients: clients.length}))
            break;
        default:
            res.statusCode = 404;
            res.end("resource does not exist");
    }
}

const server = http.createServer(requestListener);
server.listen(PORT, HOST, () => {
    console.log(`server running at http://${HOST}:${PORT}`);
});