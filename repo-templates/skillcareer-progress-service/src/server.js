const express = require('express');
const app = express();
const PORT = process.env.PORT || 5006;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'skillcareer-progress-service' });
});

app.listen(PORT, () => {
  console.log('skillcareer-progress-service listening on port ' + PORT);
});
