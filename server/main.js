const clients = new Map();

function sendList() {
    const users = Array.from(clients);
    const message = {
        type: "users",
        users
    };

    for (const s of clients)
        if (s.readyState === WebSocket.OPEN)
            s.send(JSON.stringify(message));
}

Deno.serve({
    port: 8080,
    async handler(request) {
        if (request.headers.get("upgrade") !== "websocket") {
            return;
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
            sendList();
        }

        socket.onmessage = (ev) => {
            const resp = JSON.parse(ev.data);
            const recv = clients.get(resp.to);

            if (recv && recv.readyState === WebSocket.OPEN) {
                const msg = {
                    type: "message",
                    from: uuid,
                    text: resp.text
                };

                recv.send(JSON.stringify(msg));
                console.log(`# ${uuid}: sent "${msg.text}" to ${resp.to} ;`);
            } else console.log(`# ${uuid}: failed to send message to ${resp.to} > user offline ;`);
        }

        socket.onerror = (err) => {
            console.log(`# ${uuid}: an error occured ;`);
            console.log(err);
        }

        socket.onclose = () => {
            console.log(`# ${uuid}: disconnecting... ;`);
            clients.delete(uuid);
            sendList();
        }

        return response;
    },
});