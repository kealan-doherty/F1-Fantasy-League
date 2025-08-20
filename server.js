const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const { SHA256HASH, hash } = require('./public/hash');
const { connectDb, createNewUser, disconnectDB } = require('./public/SQL_functions');
const app = express();


app.use(express.json());
app.use(express.static('public'));
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'public','index.html'));
});


app.post('/submit', async (req, res) => {
    const data = req.body;
    username = data.username;
    try{
        hashedPassowrd = await bcrypt.hash(data.password, 10); 
        connectDb();
        createNewUser(username,hashedPassowrd);
        disconnectDB();
    } catch(error){
            console.error('Error Hashing Password', error);
    }
    

    
    
});

app.post('/sign-in', (req, res) => {
    const data = req.body;
    res.send('<h1> hey this works </h1>');
});

app.listen(port, () => {
    console.log("server is up and running");
});
