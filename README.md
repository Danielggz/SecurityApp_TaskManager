# PROJECT - SecurityApp_TaskManager

# Description
This application consists of a To-Do list in which users can create, visualise, edit or delete tasks. The system will have three levels of access: admin, user and guest. The users will have a screen to log into the system using their email and password. Once completed the login, they will be able to manipulate tasks based on their access level. Admins will be able to modify everything, whereas regular users and guests will have less privileges, being the guests the least privileged because they will only be able to view but not create or edit the tasks.

# Main Branch
This branch contains only the initial version of the project. Further functionality has been added in the other branches.

# Insecure Branch
This branch contains the following insecurities for testing and learning purposes:

- SQL Injection
- XSS
- Sensitive data Exposure
  
# Secure Branch
The secure branch offers the same functionality but with secured features, so all the vulnerabilities from the other branch have been mitigated here

# SETUP
The application runs on node.js with Express.js as the main library. The database is written in sqlite3, so that will also be fundamental to be installed. to run it, node.js has to be installed in the first place, followed by these libraries:
- sqlite3
- express
- body-parser
- path
- express-session
- helmet

When all those libraries are installed, both the insecure and secure applications should run with no problems. The port used is 3000, so that will have to be free.

The users and passwords for accessing the application are as follows:
admin@fakemail.com : Abc123.
user@fakemail.com: Abc123.
guest@fakemail.com: Abc123.

