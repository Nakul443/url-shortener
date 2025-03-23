import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;
app.use(bodyParser.json());

// get - to read data from the server
app.get('/books', async (req, res) => {
  
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});