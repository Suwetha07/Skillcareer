const express = require('express');
const app = express();
const PORT = process.env.PORT || 5003;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'skillcareer-skill-service' });
});

app.listen(PORT, () => {
  console.log('skillcareer-skill-service listening on port ' + PORT);
});
