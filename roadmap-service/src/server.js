const express = require('express');
const app = express();
const PORT = process.env.PORT || 5004;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'skillcareer-roadmap-service' });
});

app.listen(PORT, () => {
  console.log('skillcareer-roadmap-service listening on port ' + PORT);
});
