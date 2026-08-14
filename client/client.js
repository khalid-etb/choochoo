const wsUri = "ws://127.0.0.1:8080";
const ws = new WebSocket(wsUri);

const sendingTo = document.querySelector("#target");
const clients = document.querySelector("#users");
const messages = document.querySelector("#messages");
const input = document.querySelector("#input");
const sendBtn = document.querySelector("#sendBtn");

let currentUUID = null;
let currentChat = null;

ws.onopen = () => {
    console.log("# connected to server ;");
}

ws.onmessage = (ev) => {
    const data = JSON.parse(ev.data);

    if (data.type === "id") currentUUID = data.uuid;

    if (data.type === "users") {
        clients.innerHTML = "";

        for (const u in data.users) {
            const div = document.createElement("div");

            div.className = "value-row";
            div.textContent = `* ${user[0]}`;

            div.addEventListener("click", () => {
                currentChat = user[0];
                sendingTo.textContent = user[0];
            });

            clients.appendChild(div);
        }
    }

    if (data.type === "message") {
        const li = document.createElement("li");
        li.textContent = `> ${data.from}: ${data.text}`;
        messages.appendChild(li);
    }
}

sendBtn.addEventListener("click", () => {
    const txt = input.value.trim();

    if (!txt) return;

    const msg = {
        type: "message",
        to: sendingTo,
        text: txt
    }

    ws.send(JSON.stringify(msg));
    input.value = "";

    const div = document.createElement("div");
    div.textContent = `< ${currentUUID}: ${txt}`;
    messages.appendChild(div);
})