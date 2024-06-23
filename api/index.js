const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const app = express()
const port = 3000

// const corsOptions = {
//   credentials: true,
//   origin: ['https://leetcode.com/', 'http://localhost:80'] // Whitelist the domains you want to allow
// };



// Initialize Firestore with your Firebase project credentials
const serviceAccount = require('./service_account_key.json');

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
    await docRef.set({
      question: question,
      code: code,
      userId: userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send a success response
    res.status(200).json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })

module.exports = app;

