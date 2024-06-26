const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const fs = require('fs');

const url = require('url');

const fetch = require('node-fetch');
const app = express();



// const corsOptions = {
//   credentials: true,
//   origin: ['https://leetcode.com/', 'http://localhost:80'] // Whitelist the domains you want to allow
// };

require('dotenv').config();
// const base64String = fs.readFileSync('service_account_key_base64.txt', 'utf8');
// const serviceAccountJSON = Buffer.from(base64String, 'base64').toString('utf-8');
// const serviceAccount = JSON.parse(serviceAccountJSON);

const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
};

//const serviceAccount = require('./service_account_key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();


app.use(cors());
app.use(bodyParser.json());


app.get('/', (req, res) => {
  res.send('Hello World!')
})

function normalizeNewlines(text) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\u00A0/g, ' ');
}



app.post('/upload', async(req, res) => {
  try {
    const question = req.body.question;
    const code = req.body.code;
    const userId = req.body.userId;
    
    // console.log(question,code,userId)
    // Validate input data
    if (!question || !code || !userId) {
      return res.status(400).json({ message: 'All values are required' });
    }
    const queryObject = url.parse(userId);
    console.log(queryObject)
    var username = queryObject.path
    if (username.startsWith('/')) {
      username = username.substring(1);
    }
 
    // Create a new document in Firestore
    const docRef = db.collection('Questions').doc();

     const data = {
      question: question,
      code: code
    };

    const normalizedBody = normalizeNewlines(JSON.stringify(data, null, 2));
    console.log(normalizedBody);
    
    const response = await fetch('http://34.125.6.114:8000/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: normalizedBody
    })

    const responseData = await response.json();
    const summary = responseData.summary;
    await docRef.set({
      question: question,
      code: code,
      userId: username,
      summary: responseData.summary,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ 
      summary: summary,
      message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.post('/showbyid', async (req, res) => {
  try {
    const userId  = req.body.userId;

    // Fetch data by userId
    const snapshot = await db.collection('Questions').where('userId', '==', userId).get();

    if (snapshot.empty) {
      console.log('No matching documents.');
      return res.status(401).json({message: "UserId not found"});
    }  
    
    // snapshot.forEach(doc => {
    //   console.log(doc.id, '=>', doc.data());
    // });
    const data = [];
    snapshot.forEach(doc => {
      // console.log(doc.data())
      data.push({
        id:doc.id,
        userId: doc.data().userId,
        question: doc.data().question,
        code : doc.data().code,
        summary: doc.data().summary
        
      });
    });
    // Send the data as a response
    res.status(200).json(data);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// app.listen(process.env.PORT, () => {
//   console.log(`Example app listening on port ${process.env.PORT}`)
// })
module.exports = app;

