const net = require("net");
const processExpressions = require("../lib/node/expressions");

let server = null;
let port = null;
let timeout = null;
let clients = new Set();

const start = (job, settings) => new Promise((resolve) => {
    settings.logger.log(`[${job.uid}] [action-lottie] server starting`);

    server = net.createServer();
    // loopback only: the After Effects script connects from this machine
    server.listen(0, "127.0.0.1", () => {
        port = server.address().port;
        settings.logger.log(`[${job.uid}] [action-lottie] server started on port ${port}`);
        resolve(port);
    });

    server.on("connection", (socket) => {
        settings.logger.log(`[${job.uid}] [action-lottie] server client connected: ${socket.remoteAddress}`);
        clients.add(socket);

        // Handle incoming data
        socket.on("data", (data) => {
            settings.logger.log(`[${job.uid}] [action-lottie] server client data received`);
            let result;
            try {
                const message = data.toString().trim();
                const parsedData = JSON.parse(message);
                result = processExpressions(parsedData.text);
            } catch (err) {
                settings.logger.error(`[${job.uid}] [action-lottie] server received invalid data: ${err.message}`);
                socket.destroy();
                return;
            }

            try {
                // Echo back to client
                var response = JSON.stringify(result) + "\n";
                socket.write(response);
                settings.logger.log(`[${job.uid}] [action-lottie] successfully sent response to client of size ${response.length} bytes`);
            } catch (err) {
                settings.logger.error(`[${job.uid}] [action-lottie] server error sending response: ${err.message}`);
            }
        });

        // Handle client disconnection
        socket.on("close", () => {
            settings.logger.log(`[${job.uid}] [action-lottie] server client disconnected: ${socket.remoteAddress}`);
            clients.delete(socket);
        });

        // Handle errors
        socket.on("error", (err) => {
            settings.logger.error(`[${job.uid}] [action-lottie] server socket error: ${err.message}`);
            clients.delete(socket);
        });
    });

    // Handle server errors
    server.on("error", (err) => {
        settings.logger.error(`[${job.uid}] [action-lottie] server error: ${err.message}`);
    });

    timeout = setTimeout(() => {
        settings.logger.log(`[${job.uid}] [action-lottie] triggering server stop after 60 seconds`);
        server.close();
    }, 60 * 1000);
});

const stop = async (job, settings) => {
    settings.logger.log(`[${job.uid}] [action-lottie] server stopping`);
    clearTimeout(timeout);
    server.close();
}

const isRunning = () => {
    return port !== null;
}

const getPort = () => {
    return port;
}

module.exports = {
    start,
    stop,
    isRunning,
    getPort,
}
