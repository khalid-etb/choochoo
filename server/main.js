const clients = new Map();

async function createResponse(path, mimeType) {
	const file = await Deno.open(path, { read: true });
	const response = new Response(file.readable);
	response.headers.set("Content-Type", mimeType);
	return response;
}

Deno.serve({
    hostname: "0.0.0.0",
    port: 8080,
    async handler(request) {
        if (request.headers.get("upgrade") !== "websocket") {
            const url = new URL(request.url);
			switch (url.pathname) {
				case "/assets/js/client.js":
					return await createResponse("./client/assets/js/client.js", "text/javascript");
                case "/assets/js/custom-caret.js":
                    return await createResponse("./client/assets/js/custom-caret.js", "text/javascript");
				case "/assets/css/styles.css":
					return await createResponse("./client/assets/css/styles.css", "text/css");
				case "/":
					return await createResponse("./client/index.html", "text/html");
				default:
					return new Response("# not found ;", { status: 404 });
            }
        }

        const { socket, response } = Deno.upgradeWebSocket(request);
        const uuid = Math.floor(10000 + Math.random() * 90000);

        socket.onopen = () => {
            clients.set(uuid, socket);
            console.log(`# connected: ${uuid} ;`);

            const msg = {
                type: "id",
                uuid
            }

            socket.send(JSON.stringify(msg));
        }

        socket.onmessage = (ev) => {
            const resp = JSON.parse(ev.data);

            for (const socket of clients.values()) {
                const msg = {
                    type: "message",
                    from: uuid,
                    text: resp.text
                };

                socket.send(JSON.stringify(msg));
                console.log(`# ${uuid}: sent "${msg.text}" ;`);
            };
        }

        socket.onerror = (err) => {
            console.log(`# ${uuid}: an error occured ;`);
            console.log(err);
        }

        socket.onclose = () => {
            console.log(`# ${uuid}: disconnecting... ;`);
            clients.delete(uuid);
        }

        return response;
    },
});