var express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const db = new sqlite3.Database('database/taskManager.db');
const path = require('path');
const port = 3000;
const app = express();

// Serve static files on public folder
app.use(express.static('../public'));

// Create jsonparser to use in post requests

var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: true });
app.use(jsonParser);
app.use(urlencodedParser);

//LOGIN - validate user details
app.post('/login', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    db.get("SELECT id from users WHERE email='" + email + "' AND password='" + password + "'", 
      function(err, user){
        if(err){
          return res.status(500).json({ error: err.message });
        }
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }else{
          res.status(201).json(user);
        }
      }
    );
});

// CREATE - Add a new task
app.post('/tasks', (req, res) => {
  const { title, description } = req.body;
  db.run(
    `INSERT INTO tasks (name, description, completed) VALUES (, , )`,
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, title, description, completed: 0 });
    }
  );
});

// READ - Get all tasks
app.get('/tasks', (req, res) => {
  db.all(`SELECT * FROM tasks`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// READ - Get a single task by ID
app.get('/tasks/:id', (req, res) => {
  db.get(`SELECT * FROM tasks WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ message: 'Task not found' });
    res.json(row);
  });
});

// UPDATE - Modify a task
app.put('/tasks/:id', (req, res) => {
  const { title, description, completed } = req.body;
  db.run(
    `UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?`,
    [title, description, completed ? 1 : 0, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ message: 'Task not found' });
      res.json({ id: req.params.id, title, description, completed });
    }
  );
});

// DELETE - Remove a task
app.delete('/tasks/:id', (req, res) => {
  db.run(`DELETE FROM tasks WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "views/login.html"));
});

app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

app.listen(process.env.PORT || 3000,function(req,res){
    console.log(`Server listening on port ${port}`);
});