const loginBtn = document.querySelector(".btn.login");
const registerBtn = document.querySelector(".btn.register");
let debounceTimer;

const loginContainer = document.querySelector(".login-container");
const userInput = document.querySelector("#username");
const passInput = document.querySelector("#password");

userInput.addEventListener("input", (e) => {
  const user = userInput.value.trim();
  clearTimeout(debounceTimer);

  registerBtn.classList.remove("btn-flash");
  loginBtn.classList.remove("btn-flash");

  if (user.length < 3) return;

  debounceTimer = setTimeout(async () => {
    try {
      const res = await fetch(
        `/api/check-user?user=${encodeURIComponent(user)}`,
      );
      const data = await res.json();

      console.log(user);

      if (data.exists) {
        console.log("found")
        loginBtn.classList.add("btn-flash");
        registerBtn.classList.remove("btn-flash");
      } else {
        console.log('notfound')
        registerBtn.classList.add("btn-flash");
        loginBtn.classList.remove("btn-flash");
      }
    } catch (err) {
      console.log("# error checking user: ", err);
    }
  }, 500);
});

loginBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const user = userInput.value;
  const pass = passInput.value;

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user: user, pass: pass }),
    });

    const data = await res.json();

    if (data.success) {
      window.location.href = "/index.html";
    } else {
      console.log("login failed successfully");
    }
  } catch (err) {
    console.log("# error logging in: ", err);
  }
});

registerBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const user = userInput.value;
  const pass = passInput.value;

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user: user, pass: pass }),
    });

    const data = await res.json();

    if (data.success) {
      window.location.href = "/index.html";
    } else {
      console.log("register failed successfully");
    }
  } catch (err) {
    console.log("# error registering: ", err);
  }
});
