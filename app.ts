import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.json({
    status: 200,
    message: 'Hello world!',
  });
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
