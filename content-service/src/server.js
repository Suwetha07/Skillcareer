const express = require('express');
const app = express();
const PORT = process.env.PORT || 5005;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'skillcareer-content-service' });
});

app.listen(PORT, () => {
  console.log('skillcareer-content-service listening on port ' + PORT);
});
