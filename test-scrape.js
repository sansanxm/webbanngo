const https = require('https');

https.get('https://tuyenquang.edu.vn/tin-tuc-su-kien', (res) => {
    let html = '';
    res.on('data', d => html += d);
    res.on('end', () => {
        // Find repeated blocks that look like news items
        const fs = require('fs');
        fs.writeFileSync('tq-edu.html', html);
        console.log("Saved to tq-edu.html");

        // Simple regex to find common article wrappers
        const classMatches = html.match(/class="[^"]*item[^"]*"/g);
        const uniqueClasses = [...new Set(classMatches)];
        console.log(uniqueClasses.slice(0, 10));
    });
}).on('error', e => console.error(e));
