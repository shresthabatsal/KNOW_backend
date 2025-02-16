const express = require('express');
const cors = require('cors');
const sequelize = require('./database/connection');
const userRoutes = require('./routes/userRoutes');
const authorRoutes = require('./routes/authorRoutes');
const articleRoutes = require('./routes/articleRoutes');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from your frontend origin
  credentials: true, // Allow cookies and credentials
}));

app.use(express.json());

app.use(userRoutes);
app.use(authorRoutes);
app.use(articleRoutes);

app.options('*', cors()); // Allow preflight requests for all routes

// Sync database and start server
sequelize.sync()
  .then(() => {
    app.listen(4000, () => console.log('Server running on port 4000'));
  })
  .catch(error => console.log('Error syncing database:', error));