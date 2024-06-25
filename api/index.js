const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const fs = require('fs');
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
  res.send('Hello World!!!!!')
})

app.post('/upload', async(req, res) => {
  try {
    const question = req.body.question;
    const code = req.body.code;
    const userId = req.body.userId;
    
    console.log(question,code,userId)
    // Validate input data
    if (!question || !code || !userId) {
      return res.status(400).json({ message: 'All values are required' });
    }

    // Create a new document in Firestore
    const docRef = db.collection('Questions').doc();
  


    // const data = {
    //   question: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\r\n\r\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\r\n\r\nYou can return the answer in any order.\r\n\r\n \r\n\r\nExample 1:\r\n\r\nInput: nums = [2,7,11,15], target = 9\r\nOutput: [0,1]\r\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].",
    //   code: "class Solution:\r\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\r\n        prevMap = {}  # val -> index\r\n\r\n        for i, n in enumerate(nums):\r\n            diff = target - n\r\n            if diff in prevMap:\r\n                return [prevMap[diff], i]\r\n            prevMap[n] = i"
    // };

     const data = {
      question: question,
      code: code
    };
    const response = await fetch('http://34.125.6.114:8000/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    const responseData = await response.json();
    const summary = responseData.summary;
    await docRef.set({
      question: question,
      code: code,
      userId: userId,
      summary: responseData.summary,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send a success response
    res.status(200).json({ 
      summary: summary,
      message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// app.listen(process.env.PORT, () => {
//   console.log(`Example app listening on port ${process.env.PORT}`)
// })

module.exports = app;

