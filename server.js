import 'dotenv/config';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import cron from 'node-cron';
import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDb, createNewUser, pullUserData, pullTeam, updateConstructor, updateDrivers, updatePts } from './public/SQL_functions.js';
import { updatePassword } from './public/SQL_functions.js';
import { updateScore, requireAuth } from './middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const secret = process.env.SESSION_SERCRET;

app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: {secure: true, httpOnly: true, maxAge: 3600000}
}));

connectDb();
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'public','index.html'));
});

app.post('/submit', async (req, res) => {
    const data = req.body;
    const username = data.username;
    const email = data.email;
    if(data.password != data.confirmPassword){
        return res.send('<h1> Error Passwords Do not match Please try again</h1>');
    }

    const hashedPassowrd = await bcrypt.hash(data.password, 10); 
    const hashedCode = await bcrypt.hash(data.passResetCode,10);

    await createNewUser(username,hashedPassowrd, email,hashedCode);
    req.session.user = {username: username};
    req.session.save();
    return res.sendFile('alterTeam.html', {root: path.join(__dirname, 'public')});
    
});

app.post('/resetPasswordConfirm', requireAuth, async (req,res) => {
    const data = req.body;
    const username = req.session.user.username;
    if(data.password != data.confirmPassword){
        return res.send('<h1> ERROR PASSWORDS DO NOT MATCH </h1>');
    }
    const hashedPassowrd = await bcrypt.hash(data.password,10);
    await updatePassword(username, hashedPassowrd);
    return res.send('<h1> Password successfully changed please return to login screen </h1>');
    
})

app.post('/sign-in', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    const userData = await pullUserData(username);
    if (!userData || userData === -1 || userData.rows.length === 0) {
        return res.send("<h1> Inncorrect Username or Password please Try Again </h1>");
    }
    const pulledPassword = userData.rows[0].password;
    
    if (await bcrypt.compare(password, pulledPassword)) {
         req.session.user = {username: username};
         req.session.save();
         return res.redirect('/profilePage');
    } else {
         return res.send("<h1> Inncorrect Username or Password please Try Again </h1>");
    }
});

app.get('/profilePage', requireAuth, async (req,res) => {
    res.sendFile('profilePage.html', {root: path.join(__dirname, 'public')});
});
app.get('/updatePassword', requireAuth, async (req,res) => {
    res.sendFile('updatePassword.html', {root: path.join(__dirname, 'public')});
});


app.get('/userData', requireAuth, async (req,res) => {
    try{
        const username = req.session.user.username;
        const data = await pullTeam(username);
        res.json(data);
    }catch (error){
        console.error('error sending teams data', error);
    }
});

app.post('/updateTeam', requireAuth, async (req,res) => {
    const username = req.session.user.username;
    const newDriverOne = req.body.first_driver;
    const newDriverTwo = req.body.second_driver;
    const newConstructor = req.body.constructor;

    try{
        await updateConstructor(username, newConstructor);
        await updateDrivers(username, newDriverOne, newDriverTwo);
        res.sendFile('profilePage.html', {root: path.join(__dirname, 'public')});
    } catch (err){
        console.error("error occured in updating team", err.message);
    }

});

app.post('/username', requireAuth, async (req,res) => {
    const data = req.session.user.username;
    console.log(data);
    try{
        res.json(data);
    } catch (error){
        console.error('error sending username to frontend', error); 
    }
});

app.post('/resetInfo', async (req,res) => {
    const username = req.body.username;
    const code = req.body.code;

    if (!username || !code) {
        return res.status(400).send('<h1> Username and code are required </h1>');
    }

    try {
        const userData = await pullTeam(username);
        if (!userData || userData === -1 || userData.rows.length === 0) {
            return res.send("<h1> Inncorrect Code please Try Again </h1>");
        }

        const pulledCode = userData.rows[0].code;
        const isValidCode = await bcrypt.compare(code, pulledCode);

        if (isValidCode) {
            req.session.user = {username: username};
            req.session.save();
            return res.redirect('/updatePassword');
        }

        return res.send("<h1> Inncorrect Code please Try Again </h1>");
    } catch(error) {
        console.error('error confirming code', error);
        return res.status(500).send('<h1> Error confirming reset code </h1>');
    }
});

cron.schedule('0 18 * * 0', () => {
    updateScore();
})

app.listen(3000, () => {
    console.log("server is up and running");
});



