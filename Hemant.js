const http = require('http');
const https = require('https');

const TARGET_URL = 'https://time.com';
const PORT = 3000;

/**
 * Fetches the latest stories from Time.com by parsing the HTML.
 * Uses only built-in string operations—no external libraries.
 * @param {Function} callback - Receives (error, storiesArray)
 */

function fetchStories(callback) {
  https.get(TARGET_URL, (res) => {
    let html = '';
    res.on('data', chunk => {
      html += chunk;
    });
    res.on('end', () => {
      try {
        const stories = [];
        // Split on <h3 to target headline blocks
        const parts = html.split('<h3');
        for (let i = 1; i < parts.length && stories.length < 6; i++) {
          const block = parts[i];
          const aTagStart = block.indexOf('<a ');
          if (aTagStart === -1) continue;

          // Extract href
          const hrefKey = 'href="';
          const hrefIndex = block.indexOf(hrefKey, aTagStart);
          if (hrefIndex === -1) continue;
          const linkStart = hrefIndex + hrefKey.length;
          const linkEnd = block.indexOf('"', linkStart);
          let link = block.substring(linkStart, linkEnd);
          // Normalize relative URLs
          if (link.startsWith('/')) link = TARGET_URL + link;

          // Extract link text (title)
          const titleStart = block.indexOf('>', linkEnd) + 1;
          const titleEnd = block.indexOf('</a>', titleStart);
          let title = block.substring(titleStart, titleEnd).trim();
          // Remove any remaining HTML tags/entities
          title = title.replace(/<[^>]+>/g, '');

          stories.push({ title, link });
        }

        callback(null, stories);
      } catch (parseErr) {
        callback(parseErr);
      }
    });
  }).on('error', (err) => {
    callback(err);
  });
}

//server
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/getTimeStories') {
    fetchStories((err, stories) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(stories));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
