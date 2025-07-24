const express = require('express');
const path = require('path');
const app = express();


app.use(express.json());
app.use(express.static('public'));
const port = 3000;



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'public'));
});

app.listen(port, () => {
    console.log("server is up and running");
});