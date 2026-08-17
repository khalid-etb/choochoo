import { Database } from "jsr:@db/sqlite";

const db = new Database("./server/users.db");
const clients = new Map();

async function createResponse(path, mimeType) {
	const file = await Deno.open(path, { read: true });
	const response = new Response(file.readable);
	response.headers.set("Content-Type", mimeType);
	return response;
}

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function handleRegister(user, pass) {
    try {
        const hashedPass = await hashPassword(pass);

        db.prepare(`
            INSERT INTO users (user, pass_hash) VALUES (?, ?);
        `).run(user, hashedPass);

        return { success: true, message: "SUCCESS!" }
    } catch (err) {
        console.log(err);
        if (err.message.includes("UNIQUE constraint failed"))
            return { success: false, message: "EXISTS!" };
        return { success: false, message: "FAILED!" };
    }
}

async function handleLogin(user, pass) {
    const hashedPass = await hashPassword(pass);

    const u = db.prepare(`
        SELECT id, user FROM users WHERE user = ? AND pass_hash = ?;
    `).get(user, hashedPass);
    
    if (u)
        return { success: true, message: "SUCCESS!", u };
    else
        return { success: false, message: "FAILED!" };
}

function existingUser(user) {
    const u = db.prepare(`
        SELECT id FROM users WHERE user = ?;
    `).get(user);

    return Boolean(u);
}

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user TEXT UNIQUE NOT NULL,
        pass_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

Deno.serve({
    hostname: "0.0.0.0",
    port: 8080,
    async handler(request) {
        if (request.headers.get("upgrade") !== "websocket") {
            const url = new URL(request.url);
			switch (url.pathname) {
                // api calls
                case "/api/check-user":
                    if (request.method === "GET") {
                        const user = url.searchParams.get("user") || "";
                        const exists = existingUser(user);

                        return new Response(JSON.stringify({ exists }), {
                            headers: { "Content-Type": "application/json" },
                            status: 200
                        });
                    } else return new Response("# GET method only ;", { status: 405 });

                case "/api/login":
                    if (request.method === "POST") {
                        const { user, pass } = await request.json();
                        const result = await handleLogin(user, pass);

                        const headers = new Headers({
                            "Content-Type": "application/json"
                        });

                        if (result.success) {
                            headers.append(
                                "Set-Cookie",
                                "auth=true; Path=/; HttpOnly; SameSite=Lax;"
                            );
                        }

                        return new Response(JSON.stringify(result), {
                            headers: headers,
                            status: result.success ? 200 : 401,
                        });
                    } else return new Response("# POST method only ;", { status: 405 });

                case "/api/register":
                    if (request.method === "POST") {
                        const { user, pass } = await request.json();
                        const result = await handleRegister(user, pass);

                        const headers = new Headers({
                            "Content-Type": "application/json"
                        });

                        if (result.success) {
                            headers.append(
                                "Set-Cookie",
                                "auth=true; Path=/; HttpOnly; SameSite=Lax;"
                            );
                        }

                        return new Response(JSON.stringify(result), {
                            headers: headers,
                            status: result.success ? 200 : 401,
                        });
                    } else return new Response("# POST method only ;", { status: 405 });

                // javascript files ;
				case "/assets/js/client.js":
					return await createResponse("./client/assets/js/client.js", "text/javascript");
                case "/assets/js/custom-caret.js":
                    return await createResponse("./client/assets/js/custom-caret.js", "text/javascript");
                case "/assets/js/login.js":
                    return await createResponse("./client/assets/js/login.js", "text/javascript");
                case "/assets/js/snake-bg.js":
                    return await createResponse("./client/assets/js/snake-bg.js", "text/javascript");

                // stylesheet files ;
				case "/assets/css/styles.css":
					return await createResponse("./client/assets/css/styles.css", "text/css");
                case "/assets/css/login.css":
					return await createResponse("./client/assets/css/login.css", "text/css");
                
                // webpages and whatnot ;
                case "/login":
                    return await createResponse("./client/login.html", "text/html");
				case "/":
                case "/index.html": {
                    const cookieHeader = request.headers.get("cookie") || "";

                    if (cookieHeader.includes("auth=true"))
					    return await createResponse("./client/index.html", "text/html");
                    else
                        return await createResponse("./client/login.html", "text/html");
                }

                // invalid url ;
				default:
					return new Response("# not found ;", { status: 404 });
            }
        }

        if (!request.headers.get("cookie").includes("auth=true")) {
            return new Response("# unauthorized ;", { status: 401 });
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