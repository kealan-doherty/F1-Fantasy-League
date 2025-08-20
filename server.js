const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const app = express();


app.use(express.json());
app.use(express.static('public'));
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'public','index.html'));
});


app.post('/submit', (req, res) => {
    const data = req.body;
    console.log(data);
    res.send('<h1> Account Created!!! </h1>');
    console.log("DATA SENT TO BACKEND YAYY!!!")
});

app.listen(port, () => {
    console.log("server is up and running");
});
