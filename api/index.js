const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express()
// const port = 3000

app.use(cors());
app.use(bodyParser.json());


app.get('/', (req, res) => {
  res.send('Hello World!!!!!')
})

app.post('/upload', (req, res) => {
    const data = req.body;
    
    res.send(data)
  })

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })

module.exports = app;

