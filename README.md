# Assignment

A simple Node.js HTTP service that scrapes the latest six headlines from Time.com using **only** built-in modules and basic string operations (no external libraries).

## Features

* Fetches `https://time.com` on each request
* Parses HTML with `split`, `indexOf`, and regex
* Extracts exactly 6 stories (`title` + `link`)
* Exposes a single GET endpoint

## Endpoint

```
GET /getTimeStories
or
GET http://localhost:3000/getTimeStories
```

**Response** (HTTP 200):

<img width="812" height="497" alt="image" src="https://github.com/user-attachments/assets/a41c8c6f-c700-4a5f-bab3-edd5340378f4" />


Errors:

* 404 for any other path
* 500 with `{ "error": "..." }` on fetch/parsing failures

## Prerequisites

* Node.js v12+ (no additional npm packages required)

## Installation & Usage

1. Clone or copy this repo into a folder.
2. Ensure your file (e.g. `Hemant.js`) contains the provided code.
3. Run:

   ```bash
   node index.js
   ```
4. Open your browser or use `curl`:

   ```bash
   curl http://localhost:3000/getTimeStories
   ```
---

*No external libraries used. All parsing is done with built-in Node.js string methods.*
