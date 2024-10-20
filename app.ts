import 'dotenv/config';
import express from 'express';
import apiRouter from './routes/api';
import cors from 'cors';
import logger from './utils/logger';

const app = express();

app.use(cors());
app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.json({
    status: 200,
    message: 'Server is up and running.',
  });
});

const port = isNaN(Number(process.env.PORT)) ? 3000 : Number(process.env.PORT);
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
