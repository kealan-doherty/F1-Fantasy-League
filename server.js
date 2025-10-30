require('dotenv').config();
const bcrypt = require('bcrypt');
const cron = require('node-cron');
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const path = require('path');
const { connectDb, createNewUser, pullUserData, pullDrivers, pullTeam, updateConstrcutor, updateDrivers, updatePts } = require('./public/SQL_functions');
const { pullDriverResults, convertPosToPts } = require('./public/pullRaceResults');
const { js } = require('three/tsl');
const app = express();


const secret = process.env.SESSION_SERCRET;

app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false, httpOnly: true, maxAge: 360000}
}));

connectDb();
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'public','index.html'));
});

app.post('/submit', async (req, res) => {
    const data = req.body;
    username = data.username;
    if(data.password != data.confirmPassword){
        res.send('<h1> Error Passwords Do not match Please try again</h1>');
    }
    hashedPassowrd = await bcrypt.hash(data.password, 10); 
    hashedEmail = await bcrypt.hash(data.email, 10);
    createNewUser(username,hashedPassowrd, hashedEmail);
    req.session.user = {username: username};
    req.session.save();
    res.sendFile('alterTeam.html', {root: path.join(__dirname, 'public')});
    
});

app.post('/sign-in', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    const userData = await pullUserData(username);
    const pulledPassword = userData.rows[0].password;
    
    if( await bcrypt.compare(data = password, hashedPassowrd = pulledPassword) == true){
         req.session.user = {username: username};
         req.session.save();
         res.redirect('/profilePage');
    } else {
         res.send("<h1> Inncorrect Username or Password please Try Again </h1>");
    }
});

app.get('/profilePage', async (req,res) => {
    res.sendFile('profilePage.html', {root: path.join(__dirname, 'public')});

});

app.get('/userData', async (req,res) => {
    try{
        const username = req.session.user.username;
        const data = await pullTeam(username);
        res.json(data);
    }catch (error){
        console.error('error sending teams data', error);
    }
});

app.post('/updateTeam', async (req,res) => {
    const username = req.session.user.username;
    const newDriverOne = req.body.first_driver;
    const newDriverTwo = req.body.second_driver;
    const newConstructor = req.body.constructor;
    try{
        await updateConstrcutor(username, newConstructor);
        await updateDrivers(username, newDriverOne, newDriverTwo);
        res.sendFile('profilePage.html', {root: path.join(__dirname, 'public')});
    } catch (err){
        console.error("error occured in updating team", err.message);
    }
    res.redirect('/ProfilePage');

});

app.post('/username', async (req,res) => {
    const data = req.session.user.username;
    console.log(data);
    try{
        res.json(data);
    } catch (error){
        console.error('error sending username to frontend', error); 
    }
});

app.post('/resetPassword', async (req,res) => {
    // here will create the reset token and send it to the user
    const email = req.body.email;
    const userData = await pullUserDatabyEmail(email); // this SQL function still needs to be written. 
    const pulledEmail = userData.rows[0].email;
    if(await bcrypt.compare(data = email, hashedEmail = pulledEmail) == true){
        // will not tell the user if the email exists in the DB or not for security reasons
        // generate secure token here using brcyt and give it expiration date and send to user
        // one app email is generated and begin developing UI for updating the password and storing it
        // within the DB
    } 
    
});

function updateScore(){
    fetch("https://api.openf1.org/v1/session_result?session_key=latest&position<=10")
        .then((response) => response.json())
        .then((jsonContent) => {
            try{
                driverResults = pullDriverResults(jsonContent);
                updatePts(driverResults);
            } catch (error){
                console.error('error updating users points');
            }
        });
}

cron.schedule('0 18 * * 1', () => {
    updateScore();
})

app.listen(3000, () => {
    console.log("server is up and running");
});



