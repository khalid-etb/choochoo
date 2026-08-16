const wsUri = `ws://${location.hostname}:8080`;
const ws = new WebSocket(wsUri);

const messages = document.querySelector(".message-stream");
const input = document.querySelector("#input-box");

const systemTime = document.querySelector("#system-time");
const systemNow = new Date();
const nowStr = systemNow.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
});
systemTime.textContent = `[${nowStr}]`;

let currentUUID = null;
let currentChat = null;

ws.onopen = () => {
  console.log("# connected to server ;");
};

ws.onmessage = (ev) => {
  const data = JSON.parse(ev.data);

  if (data.type === "id") {
    currentUUID = data.uuid;
    document.title = `conn - ${currentUUID}`;
  }

  if (data.type === "message") {
    if (data.from === currentUUID) return;

    const div = document.createElement("div");
    div.classList.add("message", "receive");

    const time = document.createElement("span");
    const senderId = document.createElement("span");
    const direction = document.createElement("span");
    const text = document.createElement("span");

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    time.textContent = `[${timeStr}]`;

    senderId.textContent = data.from;
    direction.textContent = ">";
    text.textContent = data.text;

    div.append(time, senderId, direction, text);
    messages.appendChild(div);
  }
};

input.addEventListener("keydown", (ev) => {
  if (ev.key === "Enter") {
    console.log('yo');
    ev.preventDefault();

    const txt = input.value.trim();
    if (!txt) return;

    const msg = {
      type: "message",
      text: txt,
    };

    input.value = "";
    ws.send(JSON.stringify(msg));

    const div = document.createElement("div");
    div.classList.add("message", "send");

    const time = document.createElement("span");
    const senderId = document.createElement("span");
    const direction = document.createElement("span");
    const text = document.createElement("span");

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    time.textContent = `[${timeStr}]`;

    senderId.textContent = currentUUID;
    direction.textContent = "<";
    text.textContent = msg.text;

    time.className = "timestamp";
    senderId.className = "sender-id";
    direction.className = "direction";
    text.className = "class";

    div.append(time, senderId, direction, text);
    messages.appendChild(div);
  }
});
