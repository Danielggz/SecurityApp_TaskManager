var express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('../database/taskManager.db');
const port = 3000;

var app = express();

// function getMembers() {
//     return new Promise((resolve, reject) => {
//         const members = [];
//         db.each('SELECT id, firstName, lastName FROM orderOfThePhoenix', (err, row) => {
//             if(err)
//                 reject(err);
//             else {
//                 members.push({
//                     id: row.id,
//                     firstName: row.firstName,
//                     lastName: row.lastName
//                 });
//             }
//         }, (err, n) => {
//             if(err)
//                 reject(err);
//             else {
//                 resolve(members);
//             }
//         });
//     });
// }

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// app.get("/order", async function(req, res) {
//     var members = await getMembers();
//     res.send({members});
// });

app.listen(process.env.PORT || 3000,function(req,res){
    console.log(`Server listening on port ${port}`);
});