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
//Use helmet for secure http headers
const helmet = require("helmet");
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],

        // Allow CSS from jsDelivr (Bootstrap)
        styleSrc: [
          "'self'",
          "https://cdn.jsdelivr.net",
          "'unsafe-inline'" // Bootstrap requires some inline styles
        ],

        // Allow scripts from jQuery CDN and jsDelivr (Bootstrap JS)
        scriptSrc: [
          "'self'",
          "https://ajax.googleapis.com",
          "https://cdn.jsdelivr.net"
        ],

        // Allow fonts if Bootstrap pulls them in
        fontSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],

        // Allow images and source maps from jsDelivr
        imgSrc: ["'self'", "data:", "https://cdn.jsdelivr.net"],
        connectSrc: ["'self'", "https://cdn.jsdelivr.net"]
      }
    }
  })
);

// Serve static files on public folder
app.use(express.static('../public'));

var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: true });
app.use(jsonParser);
app.use(urlencodedParser);

//Start session
app.use(session({
  secret: 'secretKey',  
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

//LOGIN - validate user details
app.post('/login', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    db.get("SELECT id, username, role from users WHERE email=? AND password=?",
      [email,password], 
      function(err, user){
        if(err){
          console.log(err.message);
          return res.status(500).json({ error: 'Connection Error' });
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
  var name = req.params.name;
  var description = req.params.description;
  var priority = req.params.priority;
  var completed = req.params.completed;

  var stmt = "INSERT INTO tasks (iduser, name, description, priority, completed) VALUES (?, ?, ?, ?, ?)";

  db.run(
    stmt,
    [idUser, name, description, priority, completed],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Error in connection" });
      }
      res.status(201).json({ id: this.lastID, idUser, name, description, priority, completed });
    }
  );
});

// READ - Get all tasks
app.get('/tasks', (req, res) => {

  //session variables
  var userId = req.session.user.userId;
  var role = req.session.user.role;

  db.all(`SELECT * FROM tasks`, [], (err, rows) => {
    if (err){
      return res.status(500).json({ error: "Error in connection" });
    } 
    //Show for each task if it can be edited by user
    var tasks = rows.map(task => {
      let canEdit = false;
      if(role === "Admin" || (role === "User" && task.iduser === userId)){
        canEdit = true;
      }
      return {
        id: task.id,
        name: task.name,
        description: task.description,
        priority: task.priority,
        completed: task.completed,
        canEdit: canEdit
      } 
    });

    res.json(tasks);
  });
});

// READ - Get a single task by ID
app.get('/tasks/:id', (req, res) => {
  db.get(`SELECT * FROM tasks WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: "Error connecting to database" });
    if (!row) return res.status(404).json({ message: 'Task not found' });
    res.json(row);
  });
});

// UPDATE - Modify a task
app.put('/tasks/:id', (req, res) => {

  //Get id from session
  var idTask = req.params.id;
  var name = req.params.name;
  var description = req.params.description;
  var priority = req.params.priority;
  var completed = req.params.completed;

  var stmt = "UPDATE tasks SET name = ?, description = ?, priority = ?,completed = ? WHERE id = ?";

  db.run(
    stmt,
    [name, description, priority, completed, idTask],
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
  db.run("DELETE FROM tasks WHERE id = ?",
    [req.params.id], 
    function (err) {
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
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, "views/login.html"));
});

app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

//Get current session
app.get('/getSession', (req, res) => {
  res.json({username: req.session.user.username, role: req.session.user.role});
});

//Log off session
app.get('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: "Failed to log out" });
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
});

app.listen(process.env.PORT || 3000,function(req,res){
    console.log(`Server listening on port ${port}`);
});