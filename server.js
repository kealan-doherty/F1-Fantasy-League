const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const { connectDb, createNewUser, disconnectDB } = require('./public/SQL_functions');
const app = express();


app.use(express.json());
app.use(express.static('public'));
const port = 3000;
connectDb();

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'public','index.html'));
});


app.post('/submit', async (req, res) => {
    const data = req.body;
    username = data.username;
    if(data.password != data.confirmPassword){
        res.send('<h1> Error Passwords Do not match Please try again');
    }
    hashedPassowrd = await bcrypt.hash(data.password, 10); 
    createNewUser(username,hashedPassowrd);
    res.send('<h1> you have made your new account click below to sign in </h1>');
});

app.post('/sign-in', (req, res) => {
    const data = req.body;
    res.send('<h1> hey this works </h1>');
});

app.listen(port, () => {
    console.log("server is up and running");
});



