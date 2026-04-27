const express = require('express');
const app = express();
const PORT = process.env.PORT || 5002;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'skillcareer-career-service' });
});

app.listen(PORT, () => {
  console.log('skillcareer-career-service listening on port ' + PORT);
});
