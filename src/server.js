// src/server.js
import express from 'express';
import routes from './routes.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(routes);

// optional health endpoint
app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
