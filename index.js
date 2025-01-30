//index.js

const express = require('express');
const sequelize = require('./database/connection');
const userRoutes = require('./routes/userRoutes');
const app = express();

app.use(express.json());

app.use(userRoutes);

const articleRoutes = require('./routes/articleRoutes');

// Include article routes
app.use(articleRoutes);



// Sync database and start server
sequelize.sync()
  .then(() => {
    app.listen(4000, () => console.log('Server running on port 4000'));
  })
  .catch(error => console.log('Error syncing database:', error));