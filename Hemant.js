const http = require('http');
const https = require('https');

const PORT = 3000;
const TIME_URL = 'https://time.com';

function fetchTimeStories(callback) {
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    };

    https.get(TIME_URL, options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            const stories = extractStories(data);
            callback(null, stories);
        });
    }).on('error', (err) => {
        callback(err, null);
    });
}

function cleanHtml(str) {
    // Remove HTML tags
    str = str.replace(/<[^>]+>/g, '');
    
    // Replace common HTML entities
    const entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&nbsp;': ' '
    };
    
    for (let entity in entities) {
        str = str.replace(new RegExp(entity, 'g'), entities[entity]);
    }
    
    return str.trim();
}

function isValidStory(link) {
    // Exclude section links
    if (link.includes('/section/')) return false;
    
    // Exclude non-article pages
    const invalidPaths = ['/author/', '/tag/', '/category/', '/video/'];
    return !invalidPaths.some(path => link.includes(path));
}

function extractStories(html) {
    const stories = [];
    let currentIndex = 0;

    // Look for the latest stories section
    while (stories.length < 6 && currentIndex < html.length) {
        // Look for article elements
        const articleStart = html.indexOf('<article', currentIndex);
        if (articleStart === -1) break;
        
        const articleEnd = html.indexOf('</article>', articleStart);
        if (articleEnd === -1) break;

        const article = html.substring(articleStart, articleEnd);
        
        // Look for anchor tag with headline class
        const anchorStart = article.indexOf('<a');
        if (anchorStart !== -1) {
            // Extract href
            const hrefStart = article.indexOf('href="', anchorStart);
            if (hrefStart !== -1) {
                const hrefEnd = article.indexOf('"', hrefStart + 6);
                if (hrefEnd !== -1) {
                    let link = article.substring(hrefStart + 6, hrefEnd);
                    
                    // Ensure link starts with https://time.com
                    if (!link.startsWith('https://time.com')) {
                        if (link.startsWith('/')) {
                            link = 'https://time.com' + link;
                        } else {
                            currentIndex = articleEnd + 1;
                            continue;
                        }
                    }

                    // Skip if not a valid story
                    if (!isValidStory(link)) {
                        currentIndex = articleEnd + 1;
                        continue;
                    }

                    // Look for headline text
                    const headlineStart = article.indexOf('>', hrefEnd) + 1;
                    if (headlineStart !== 0) {
                        const headlineEnd = article.indexOf('</a>', headlineStart);
                        if (headlineEnd !== -1) {
                            let title = article.substring(headlineStart, headlineEnd).trim();
                            title = cleanHtml(title);
                            
                            // Only add if we have both title and link and it's not a duplicate
                            if (title && title.length > 5 && link && !stories.some(story => story.title === title)) {
                                stories.push({ title, link });
                            }
                        }
                    }
                }
            }
        }
        
        currentIndex = articleEnd + 1;
    }

    return stories.slice(0, 6);
}

const server = http.createServer((req, res) => {
    if (req.url === '/getTimeStories' && req.method === 'GET') {
        fetchTimeStories((err, stories) => {
            res.setHeader('Content-Type', 'application/json');
            
            if (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Failed to fetch stories' }));
                return;
            }

            res.statusCode = 200;
            res.end(JSON.stringify(stories));
        });
    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
