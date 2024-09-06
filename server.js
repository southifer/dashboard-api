const express = require('express');
const axios = require('axios');
const fs = require('fs');
const bodyParser = require('body-parser');
const https = require('https');
const mysql = require('mysql');
const cors = require('cors'); // Import cors
const multer = require('multer');

const routerFile = "router.txt";
const awsDataFile = 'awsData.json';

// Create an Express app
const app = express();
const port = 5000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sayasenang@123', // Update with your database password
    database: 'noir' // Update with your database name
});


// Connect to MySQL
db.connect(err => {
    if (err) {
      console.error('Could not connect to MySQL:', err);
      process.exit(1);
    }
    console.log('Connected to MySQL');
});

// Use body-parser middleware to parse JSON requests
app.use(bodyParser.json());
app.use(cors()); // Enable CORS

// Multer configuration for file upload
const upload = multer({ dest: 'uploads/' });

// File and data variables
let awsData = [];
let routerIp = [];

// Route to handle POST request
app.post('/api/users', (req, res) => {
    const user = req.body;
  
    // Check if record with same index exists
    const checkQuery = 'SELECT * FROM users WHERE `index` = ?';
    db.query(checkQuery, [user.index], (err, results) => {
        if (err) {
            console.error('Error checking existing data:', err);
            return res.status(500).json({ error: 'Error checking existing data' });
        }
  
        if (results.length > 0) {
            // Record exists, update it
            const updateQuery = `
                UPDATE users
                SET username = ?, level = ?, ping = ?, status = ?, rotation_status = ?, proxy = ?, world = ?, malady = ? , position = ?, gems = ?, playtime = ?, online_time = ?, age = ?
                WHERE \`index\` = ?
            `;
            const updateValues = [
                user.username, user.level, user.ping, user.status, user.rotation_status,
                user.proxy, user.world, user.malady, user.position, user.gems, 
                user.playtime, user.online_time, user.age, user.index
            ];
            db.query(updateQuery, updateValues, (err, results) => {
            if (err) {
                console.error('Error updating data:', err);
                return res.status(500).json({ error: 'Error updating data' });
            }
            res.status(200).json({ message: 'Data updated successfully' });
            });
        } else {
            // Record does not exist, insert new
            const insertQuery = `
                INSERT INTO users (\`index\`, username, level, ping, status, rotation_status, proxy, world, position, malady, gems, playtime, online_time, age)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const insertValues = [
                user.index, user.username, user.level, user.ping, user.status,
                user.rotation_status, user.proxy, user.world, user.position,
                user.gems, user.obtained_gems, user.playtime, user.online_time, user.age
            ];
            db.query(insertQuery, insertValues, (err, results) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ error: 'Error inserting data' });
            }
            res.status(200).json({ message: 'Data inserted successfully' });
            });
        }
    });
});  

// Route to handle GET request
app.get('/api/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            res.status(500).json({ message: err.message });
        } else {
            res.json(results);
        }
    });
});

// Delete users by index endpoint
app.delete('/api/users/:index', (req, res) => {
    const { index } = req.params;
    db.query('DELETE FROM users WHERE `index` = ?', [index], (err, results) => {
    if (err) throw err;
        res.json({ success: true });
    });
});

// Get all worlds
app.get('/api/worlds', (req, res) => {
    db.query('SELECT * FROM worlds', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Insert a new world
app.post('/api/worlds', (req, res) => {
    const { name, door } = req.body;
    const sql = 'INSERT INTO worlds (name, door) VALUES (?, ?)';
    db.query(sql, [name, door], (err, results) => {
        if (err) throw err;
        res.json({ success: true, id: results.insertId });
    });
});

// Update a world
app.put('/api/worlds/:index', (req, res) => {
    const { name, door } = req.body;
    const { index } = req.params;
    db.query('UPDATE worlds SET name = ?, door = ? WHERE `index` = ?', [name, door, index], (err, results) => {
        if (err) throw err;
        res.json({ success: true });
    });
});

// Delete a world
app.delete('/api/worlds/:index', (req, res) => {
    const { index } = req.params;
    db.query('DELETE FROM worlds WHERE `index` = ?', [index], (err, results) => {
        if (err) throw err;
        res.json({ success: true });
    });
});

// Upload .txt file and parse it
app.post('/api/worlds/upload', upload.single('file'), (req, res) => {
    const fs = require('fs');
    const filePath = req.file.path;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Error reading file' });
        }

        const worlds = data.split('\n').map(line => line.split('|'));
        const sql = 'INSERT INTO worlds (name, door) VALUES ?';
        db.query(sql, [worlds], (err, results) => {
        if (err) throw err;
            res.json({ success: true });
        });
    });
});

// Function to read router IPs from file
async function loadRouterIps() {
    return new Promise((resolve, reject) => {
        fs.readFile(routerFile, 'utf8', (err, data) => {
            if (err) {
                return reject(`Error reading router file: ${err}`);
            }
            routerIp = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            resolve();
        });
    });
}

// Fetch and edit JSON function
async function fetchAndEditJson(link) {
    while (true) {
        try {
            const response = await axios.get(link, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
            const data = response.data;

            if (data.success && (
                data.result.newIp.startsWith('13.') || 
                data.result.newIp.startsWith('18.') || 
                data.result.newIp.startsWith('35.') ||
                data.result.newIp.startsWith('99.') ||
                data.result.newIp.startsWith('100.')
            )) {
                console.table([
                    { status: data.success, executionTime: data.executionTime, newIp: data.result.newIp || 'Nil' }
                ]);

                return data;
            }

        } catch (error) {
            console.error(`Error fetching data: ${error}`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

// API to count numbers
app.post('/network/count', (req, res) => {
    const number = parseInt(req.body.number, 10);
    if (isNaN(number)) {
        return res.status(400).json({ error: 'Invalid number provided.' });
    }
    const hasilHitung = number - 1080;
    res.json({ result: hasilHitung });
});

// API to check IPs
app.post('/network/checkip', async (req, res) => {
    if (awsData.length === 0) {
        return res.status(400).json({ error: 'No data available.' });
    }

    const entriesWithIp = [];
    const entriesWithoutIp = [];

    awsData.forEach((item) => {
        Object.keys(item).forEach(key => {
            const details = item[key];
            if (details.ip && details.ip.trim() !== '') {
                entriesWithIp.push(details);
            } else {
                entriesWithoutIp.push(details);
            }
        });
    });

    const configNames = entriesWithoutIp.map(entry => entry.configName);

    res.json({
        validConfig: entriesWithIp.length,
        invalidConfig: {
            count: entriesWithoutIp.length,
            configNames: configNames
        }
    });
});

// API to process commands
app.post('/network/ck', async (req, res) => {
    const linkSpec = req.body.linkSpec;
    const author = req.body.author || 'TerminalUser';

    if (awsData.length === 0) {
        await processCommandCheck();
    }

    let resultData = [];

    if (linkSpec.includes('-')) {
        resultData = await processRangeMode(linkSpec, author);
    } else if (linkSpec.includes('/')) {
        resultData = await processMixedMode(linkSpec, author);
    } else {
        const singleResult = await processSingleMode(linkSpec, author);
        resultData.push(singleResult);
    }

    res.json(resultData);
});

// API to list data
app.post('/network/list', async (req, res) => {
    if (awsData.length === 0) {
        await processCommandCheck();
    }

    try {
        const data = awsData.flatMap(item => {
            return Object.values(item).map(link => ({
                configName: link.configName,
                url: link.newip,
                validate: link.ip && link.ip.trim() !== ''
            }));
        });

        if (data.length > 0) {
            res.json(data);
        } else {
            res.json({ message: "The links list is empty." });
        }
    } catch (e) {
        res.status(500).json({ error: `An error occurred: ${e}` });
    }
});

// API to reload config
app.post('/network/reload', async (req, res) => {
    try {
        await processCommandCheck();
        res.json({ message: 'Config reloaded successfully.' });
    } catch (e) {
        res.status(500).json({ error: `An error occurred while reloading config: ${e}` });
    }
});

// Function to process command check
async function processCommandCheck() {
    try {
        if (routerIp.length === 0) {
            await loadRouterIps();
        }

        if (routerIp.length === 0) {
            throw new Error(`The routerIp array is empty.`);
        }

        const ipSet = new Set();

        routerIp.forEach(link => {
            if (isValidIp(link)) {
                ipSet.add(link);
            } else {
                console.warn(`Invalid IP address found: ${link}`);
            }
        });

        for (const ip of ipSet) {
            const url = `http://${ip}:3000/gt/checkConfig`;
            try {
                const response = await axios.get(url, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
                const data = response.data;
                const awsResult = data.result.aws;

                awsResult.forEach(item => {
                    const key = item.configName;
                    const itemWithHost = { ...item, host: ip, newip: `http://${ip}:3000/gt/newip?configName=${item.configName}` };

                    const existingIndex = awsData.findIndex(d => d[key]);
                    if (existingIndex !== -1) {
                        awsData[existingIndex][key] = itemWithHost;
                    } else {
                        awsData.push({ [key]: itemWithHost });
                    }
                });

                console.log(`Data inserted : ${ip}`);
            } catch (error) {
                console.error(`Error fetching config for ${ip}: ${error}`);
            }
        }

        saveAwsDataToFile();
    } catch (e) {
        console.error(`An error occurred: ${e}`);
    }
}

// Function to check if IP is valid
function isValidIp(ip) {
    const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipPattern.test(ip);
}

// Function to process single mode
async function processSingleMode(linkSpec, author) {
    const number = parseInt(linkSpec, 10);
    const item = awsData.find(data => data[`AC-${linkSpec}`]);

    if (!item) {
        throw new Error(`No data found for index ${number}.`);
    }

    const result = await fetchAndEditJson(item[`AC-${linkSpec}`].newip);
    return result;
}

// Function to process range mode
async function processRangeMode(linkSpec, author) {
    const numbers = parseLinkSpec(linkSpec);
    let resultData = [];

    for (const number of numbers) {
        const singleResult = await processSingleMode(number.toString(), author);
        resultData.push(singleResult);
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return resultData;
}

// Function to process mixed mode
async function processMixedMode(linkSpec, author) {
    const parts = linkSpec.split('/');
    let resultData = [];

    for (const part of parts) {
        if (part.includes('-')) {
            const rangeResults = await processRangeMode(part, author);
            resultData = resultData.concat(rangeResults);
        } else {
            const singleResult = await processSingleMode(part, author);
            resultData.push(singleResult);
        }
    }

    return resultData;
}

// Function to parse link spec
function parseLinkSpec(linkSpec) {
    const parts = linkSpec.split('-');
    const start = parseInt(parts[0], 10);
    const end = parseInt(parts[1], 10);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// Function to save AWS data to file
function saveAwsDataToFile() {
    try {
        fs.writeFileSync(awsDataFile, JSON.stringify(awsData, null, 2), 'utf8');
        console.log(`awsData has been saved to ${awsDataFile}`);
    } catch (err) {
        console.error(`Error saving awsData to file: ${err.message}`);
    }
}

// Load router IPs from file when starting the application
loadRouterIps().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}).catch(err => {
    console.error(err);
});
