const express = require('express');
const app = express();
const PORT = process.env.PORT || 5001;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'skillcareer-user-service' });
});

app.listen(PORT, () => {
  console.log('skillcareer-user-service listening on port ' + PORT);
});
