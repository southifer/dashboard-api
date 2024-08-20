const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const multer = require('multer');
const cors = require('cors'); // Import cors

const app = express();
const port = 5000;

// Create MySQL connection
const db = mysql.createConnection({
  host: '93.113.180.31',
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

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS

// Multer configuration for file upload
const upload = multer({ dest: 'uploads/' });

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
          SET username = ?, level = ?, ping = ?, status = ?, rotation_status = ?, proxy = ?, world = ?, position = ?, gems = ?, obtained_gems = ?, playtime = ?, online_time = ?, age = ?
          WHERE \`index\` = ?
        `;
        const updateValues = [
          user.username, user.level, user.ping, user.status, user.rotation_status,
          user.proxy, user.world, user.position, user.gems, user.obtained_gems,
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
          INSERT INTO users (\`index\`, username, level, ping, status, rotation_status, proxy, world, position, gems, obtained_gems, playtime, online_time, age)
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

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
