import {Md5} from 'ts-md5';
// base-62 gives the smallest possible hasing solution
// but we will be using md5 hashing

  /* TODO:
    1. Hash the url into shortened_url
    Package: https://www.npmjs.com/package/ts-md5
    2. Study server redirects: https://dev.to/mochafreddo/understanding-resredirect-and-resrender-in-expressjs-usage-and-security-measures-2k60 - DONE

    doubt in server render

    3. Study JWTs --> authentication and authorization
      https://www.youtube.com/watch?v=K6pwjJ5h0Gg
      https://www.youtube.com/watch?v=7Q17ubqLfaM

    url -> hash -> shortened_url
  */

// import express from 'express';
import bodyParser from 'body-parser';
// const mysql = require('mysql2'); // old syntax
import getConnection from './db';
import express from 'express';
import jwt from 'jsonwebtoken';
import { idText } from 'typescript';
import db from './db';


const app = express();
const port = 3000;
app.use(bodyParser.json());

// const secretKey = "Secret Key"; // secret key for JWT, should be stored in environment variables in production

// makes it easier to manage things
interface CreateUrlRequest {
  url: string,
  userId: number
}

interface SignUpRequest {
  name: string,
  age: number,
  phone: string
}

// post API for user signup
/*
// app.post('/signup', async (req, res) => {
//   const data: SignUpRequest = req.body; // 'data' is a variable of type 'SignUpRequest'

//   // validation logic

//   const sql = "INSERT INTO users (name,age,phone) VALUES(?,?,?)";
//   const connection = await getConnection();
//   const results = await connection.execute<any>(sql,[data.name,data.age,data.phone]);

//   const token = jwt.sign({ id : results[0].insertId }, secretKey);
//   res.send(token);
// })
*/

// 'post' API to send data to the server by providing the URL
app.post('/urls/createShortURL', async (req, res) => {
  const data: CreateUrlRequest = req.body; // 'data' is a variable of type 'CreateUrlRequest'
  // post request always have 'req.body' as the data (the user sends)
  console.log(data,req.body);

  // to check if the url sent by the user is correct or not
  if(!isValidUrl(data.url)) {
    res.status(400).json({"error": "INVALID URL"}); // 4XX means the error is from user side
    res.end(); // to terminate the request, similar to disconnect in websockets
    return;
  }

  const shortUrl = hashUrl(data.url);
  // store this into the database
    
  let sql = 'INSERT INTO urls (url,shortened_url,user_id) VALUES(?,?,?)';
  // ? - place holder
  // question mark and then use connection.query to automatically store values
  // there should be no mismatch in size

  let connection = await getConnection(); // connect database to typescript
  await connection.query(sql,[data.url,shortUrl,data.userId]);
  // user input is received from 'req.body.url', to access 'fields' inside req.body, data variable is created, and req.body is stored inside data variable

  console.log(data);
  res.send(data); // sends the 'data' variable back to the user
  // can send back anything to the user
});

// API to get the performance of a URL
// this API will return the views, url and shortened_url
app.get('/url/performance/:id', async (req: any, res: any) => {
  const id : number = req.params.id; // input received from the user
  const sql = 'SELECT views, url, shortened_url FROM urls WHERE id = ?';

  const connection = await getConnection(); // connect database to typescript
  const [results, _] = await connection.execute<any[]>(sql, [id]);
  if (results.length === 0) {
    return res.status(404).send('URL NOT FOUND');
  }
  console.log(results);
/*
results = [
  {
    views: 100,
    url: 'http://www.google.com',
    shortened_url: 'abc123',
    user_id: 1 (not shown in the results)
  }
]
*/
});

// api to redirect the user to the original url
// when the user clicks on the shortened url through the browser, this API will be called
// the user will be redirected to the original url
app.get('/:hash', async (req: any, res: any) => {
  const hash = req.params.hash; // the API will receive input from the user and that can be accessed using 'req.params.hash'
  const connection = await getConnection();
  
  const sql = 'select url from urls where shortened_url = ?'; // shortened url which is hash, get the corresponding original url
  const [results, _] = await connection.execute<any[]>(sql, [hash]);
  if (results.length === 0) {
    return res.status(404).send('URL NOT FOUND');
  }
  console.log(results);
  res.redirect(results[0].url); // results[0] : gives us the JSON object {url : <url>}, to access it type '.url' to get the object
/*
results = [
  {
    url: '<whatever url is associated with the hashed value (shortened url)>'
  }
]
*/
});


app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});


function hashUrl(originalUrl : string) : string {
/*
- The full MD5 hash is 32 hexadecimal characters long. This is often too long for a "shortened" URL.
- The goal of URL shortening is to create a much shorter, more manageable URL.
- substring(0, 8) takes only the first 8 characters of the hash, significantly reducing the length.
- By truncating the hash, we introduce a higher risk of collisions (where two different URLs produce the same shortened hash).
*/

  // hash the url
  const hash = Md5.hashStr(originalUrl);

  const shortHash = hash.substring(0,8);
  return shortHash;
}

// function to check if a url is valid or not
function isValidUrl(url: string) : boolean {
  const regexp = new RegExp('^https?://(?:[a-zA-Z0-9.-]+.)[a-zA-Z]{2,}$');
  const test = regexp.test(url);
  if (test) return true;
  else return false;
}