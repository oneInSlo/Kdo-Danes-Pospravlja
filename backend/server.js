const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const knex = require("knex");
const knexConfig = require("./knexfile").development;
const cron = require('node-cron');
const checkAndSendEmails = require('./smtp/check')
const {startRecurringTasksUpdate} = require('./taskService/responsibleUsers');


const app = express();

const db = knex(knexConfig);

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());

// Import routes
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const unitRoutes = require("./routes/units");
const userRoutes = require("./routes/users");
const roomRoutes = require("./routes/rooms");
const mapRoutes = require("./routes/map");

// Use routes
app.use(authRoutes);
app.use(taskRoutes);
app.use(unitRoutes);
app.use(userRoutes);
app.use(mapRoutes);
app.use(roomRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/:page", (req, res) => {
  const page = req.params.page;

  res.sendFile(path.join(__dirname, "views", page + '.html'), (err) => {
    if (err) {
      // res.status(404).json({ error: 'Not Found' });
      res.status(404).sendFile(path.join(__dirname, "views", "not-found.html"));
    }
  });
});

// 404 middleware
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});


cron.schedule('0 6 * * *', () => {  
  //console.log('Daily emails triggered'); 
  checkAndSendEmails();
}, {
  scheduled: true,
  timezone: "Europe/Ljubljana" 
});


//cron.schedule('*///1 * * * *', () => { 
  /* 
  console.log('Cron job triggered'); 
  checkAndSendEmails();
}, {
  scheduled: true,
  timezone: "Europe/Ljubljana" 
});
*/
console.log('Email scheduling service is running...');

startRecurringTasksUpdate();


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});




module.exports = db;