require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('🚀 OpoSearch API funcionando');
});

app.listen(port, () => {
  console.log(`Server corriendo en http://localhost:${port}`);
});