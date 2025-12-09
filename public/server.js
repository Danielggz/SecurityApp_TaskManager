var express = require('express');
const sqlite3 = require('sqlite3');
//Body parser to use in post requests
const bodyParser = require('body-parser');
//Use sqlite3 database
const db = new sqlite3.Database('database/taskManager.db');
//Use path for redirecting
const path = require('path');
const port = 3000;
//Use session control
const session = require('express-session');
const app = express();

// Serve static files on public folder
app.use(express.static('../public'));

var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: true });
app.use(jsonParser);
app.use(urlencodedParser);

//Start session
app.use(session({
  secret: 'guest',   // change this to something secure
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }    // set secure: true if using HTTPS
}));

//LOGIN - validate user details
app.post('/login', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    db.get("SELECT id, username, role from users WHERE email='" + email + "' AND password='" + password + "'", 
      function(err, user){
        if(err){
          return res.status(500).json({ error: err.message });
        }
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }else{
          //Start new session
          req.session.user = { userId: user.id, username: user.username, role: user.role };
          res.status(201).json(user);
        }
      }
    );
});

// CREATE - Add a new task
app.post('/tasks', (req, res) => {

  //Get id from session
  var idUser = req.session.user.userId;
  var name = req.body.name;
  var description = req.body.description;
  var priority = req.body.priority;
  var completed = req.body.completed;

  var stmt;
  stmt = "INSERT INTO tasks (iduser, name, description, priority, completed) VALUES (" + idUser + ", '" + name + "', '" + description + "', " + priority + ", " + completed + ")";

  console.log(stmt);
  db.run(
    stmt,
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, idUser, name, description, priority, completed });
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

  //Get id from session
  var idTask = req.body.id;
  var name = req.body.name;
  var description = req.body.description;
  var priority = req.body.priority;
  var completed = req.body.completed;

  var stmt = "UPDATE tasks SET name = " + name + ", description = " + description + ", priority = " + priority + ",completed = " + completed + " WHERE id = " + idTask;

  console.log(stmt);
  db.run(
    stmt,
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.status(201).json({ id: this.lastID, name, description, priority, completed });
    }
  );
});

// DELETE - Remove a task
app.delete('/tasks/:id', (req, res) => {
  db.run(`DELETE FROM tasks WHERE id = ?`, [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "views/login.html"));
});

app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

//Get current session
app.get('/getSession', (req, res) => {
  res.json({userId: req.session.user.userId, username: req.session.user.username, role: req.session.user.role});
});

app.listen(process.env.PORT || 3000,function(req,res){
    console.log(`Server listening on port ${port}`);
});