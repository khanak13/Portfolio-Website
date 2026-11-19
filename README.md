# Khanak Jain — Portfolio

Static portfolio site: plain HTML, CSS and JS, no build step.

- `index.html` — home (desktop-style widgets, projects, about, contact)
- `case-study.html?project=focus|cashfree|yellow|adobe` — project pages
- `playground.html` — draggable board with the ask-khanak terminal and visitor sticky notes (kept in `sessionStorage`, cleared when the tab closes)

## Run locally

```bash
python3 -m http.server 8080
```

Open http://localhost:8080.

## Deploy

Any static host works. On GitHub Pages: Settings → Pages → deploy from the `main` branch, root folder.

## Secrets

The site itself needs no keys. If the chatbot later needs one, put it in `.env` (git-ignored) on the server side — never in the HTML or JS, which every visitor can read.

## To do

- Terminal chatbot: replace `askBot()` in `playground.html` with a call to the chatbot API.
- After changing `style.css` or `script.js`, bump the `?v=` number in the HTML so browsers load the new file.
