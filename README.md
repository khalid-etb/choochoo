<p align="center">
  <a href="https://github.com/khalid-etb/scrob">
    <img src=".github/assets/logo.png" alt="Logo" width="80" height="80">
  </a>
</p>

<h3 align="center">choochoo</h3>

<p align="center">lightweight self-hosted chat application.</p>

## & description

a little project to dive deeper into websocket connections and common chat application functionality ;

## & getting started
### ! dependencies

* deno
* private server (optional)

### ! installation

install **deno** onto your private server or your preferred device to host the server ;

**\* windows:**
```bash
  $ irm https://deno.land/install.ps1 | iex
```

**\* macos / linux:**
```bash
  $ curl -fsSL https://deno.land/install.sh | sh
```

afterwards, clone the repo:

```bash
  $ git clone https://github.com/khalid-etb/choochoo.git && cd choochoo
```

### ! running

after installing **deno**, run this command in your cli:
```bash
  $ deno run --allow-net --allow-read=./client server/main.js
```

### ! connecting

to connect to the server, first get your local / public ip depending on where you want to connect from.

*p.s. you need to setup port forwarding if you'd like to connect from anywhere and allow port `8080` > [guide](https://www.noip.com/support/knowledgebase/general-port-forwarding-guide)*

finding your local ip can be done through your cli.

**\* windows:** (look for your ipv4 address *e.g. `192.168.1.50`*)
```bash
  $ ipconfig
```

**\* macos:**
```bash
  $ ipconfig getifaddr en0
```

**\* linux:**
```bash
  $ hostname -I | awk '{print $1}'
```
## author

- [@khalid-etb](https://www.github.com/khalid-etb)

## version history
* 0.1
    * initial release
## license

this project is licensed under the [MIT](https://github.com/khalid-etb/choochoo/blob/main/LICENSE.md) license - see the `LICENSE.md` file for details