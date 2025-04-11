import {Md5} from 'ts-md5';
// base-62 gives the smallest possible hasing solution
// but we will be using md5 hashing


/*
this.connection = await mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'rest_api',
});
*/

import express from 'express';
import bodyParser from 'body-parser';
// const mysql = require('mysql2'); // old syntax
import getConnection from './db';



const app = express();
const port = 3000;
app.use(bodyParser.json());




// Create a connection, connect server to db


// makes it easier to manage things
interface CreateUrlRequest {
  url: string,
  userId: number
}

app.post('/urls', async (req, res) => {
  const data: CreateUrlRequest = req.body; // 'data' is a variable of type 'CreateUrlRequest'
  // post request always have 'req.body' as the data (the user sends)
  // console.log(data,req.body);

  // to check if the url sent by the user is correct or not
  if(!isValidUrl(data.url)) {
    res.status(400).send("INVALID URL"); // 4XX means the error is from user side
    res.end(); // to terminate the request, similar to disconnect in websockets
    return;
  }





  
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






    
  const sql = 'INSERT INTO urls (url,shortened_url,user_id) VALUES(?,?,?)';
  // ? - place holder
  // question mark and then use connection.query to automatically store values
  // there should be no mismatch in size

  const connection = await getConnection(); // connect database to typescript
  await connection.query(sql,[data.url,data.url,data.userId]);
  // user input is received from 'req.body.url', to access 'fields' data variable is created, and req.body is stored inside data variable


  console.log(data);
  res.send(data); // sends the 'data' variable back to the user
  // can send back anything to the user
});



// user will provide the detail and this API will return the views stored inside the database
app.get('/urls/:id', async (req, res) => {
  const id: number = Number(req.params.id); // input received from the user
  console.log('id: ', id);

  const connection = await getConnection();
  // callbacks
  // connection.query('SELECT url,shortened_url,user_id FROM urls WHERE id = ?', (err: any, results: any) => {
  //   if (err) {
  //     return res.status(500).send('Database error');
  //   }
  //   else {
  //     res.send();
  //   }
  // });

  // promise
  const [results, _] = await connection.execute<any[]>('SELECT url,shortened_url,user_id FROM urls WHERE id = ?', [id]);
  console.log(results);
  res.send(results[0]);
});





app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});


function hashUrl(url : string) : string {
  
  return "";
}


function isValidUrl(url: string) : boolean {
  const regexp = new RegExp('^https?://(?:[a-zA-Z0-9.-]+.)[a-zA-Z]{2,}$');
  const test = regexp.test(url);
  if (test) return true;
  else return false;
}