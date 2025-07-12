const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Sample route
app.get('/', (req, res) => {
  res.send('API is working!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});