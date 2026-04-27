const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'skillcareer-api-gateway' });
});

app.listen(PORT, () => {
  console.log('skillcareer-api-gateway listening on port ' + PORT);
});
