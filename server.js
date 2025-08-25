const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const { connectDb, createNewUser, disconnectDB, pullUserData } = require('./public/SQL_functions');
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

app.post('/sign-in', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    const userData = await pullUserData(username);
    const pulledPassword = userData.rows[0].password;
    
    if( await bcrypt.compare(data = password, hashedPassowrd = pulledPassword) == true){
        return res.redirect('/profilePage');
    } else {
        return res.send("<h1> Inncorrect Username or Password please Try Again </h1>");
    }
});


app.get('/profilePage', async (req,res) => {
    console.log('hey there');
    res.sendFile('profilePage.html', {root: path.join(__dirname, 'public')});
});


app.listen(port, () => {
    console.log("server is up and running");
});



