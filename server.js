import 'dotenv/config';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import cron from 'node-cron';
import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { connectDb, createNewUser, pullUserData, pullTeam, updateConstructor, updateDrivers, updatePts, storeResetToken, pullResetToken, clearResetToken } from './public/SQL_functions.js';
import { updatePassword } from './public/SQL_functions.js';
import { updateScore, requireAuth, validateNewUser, validateSignIn, handleValidationErrors, validateResetInfo, validatePasswordReset } from './middleware.js';
import { genPasswordToken } from './generatePasswordToken.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const secret = process.env.SESSION_SECRET;

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

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'public','index.html'));
});

app.post('/submit', validateNewUser, handleValidationErrors, async (req, res) => {
    const data = req.body;
    const username = data.username;
    const email = data.email;
    
    const hashedPassowrd = await bcrypt.hash(data.password, 10); 

    await createNewUser(username, hashedPassowrd, email);
    req.session.user = {username: username};
    req.session.save();
    return res.sendFile('alterTeam.html', {root: path.join(__dirname, 'public')});
    
});

app.post('/resetPasswordConfirm', validatePasswordReset, handleValidationErrors, requireAuth, async (req,res) => {
    const data = req.body;
    const username = req.session.user.username;
    
    const hashedPassowrd = await bcrypt.hash(data.password,10);
    await updatePassword(username, hashedPassowrd);
    return res.send('<h1> Password successfully changed please return to login screen </h1>');
    
});

app.post('/sign-in', validateSignIn, handleValidationErrors, async (req, res) => {
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

app.get('/username', requireAuth, async (req,res) => {
    const data = req.session.user.username;
    try{
        res.json(data);
    } catch (error){
        console.error('error sending username to frontend', error); 
    }
});

app.post('/requestReset', async (req, res) => {
    const email = req.body.email;
    const genericResponse = '<h1> If that email address is registered, a reset code has been sent to it </h1>';

    try {
        const { token, hashedToken } = await genPasswordToken();
        const expiry = new Date(Date.now() + 15 * 60 * 1000);

        const result = await storeResetToken(email, hashedToken, expiry);
        if (!result || result === -1 || result === 0) {
            return res.send(genericResponse);
        }

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: 'F1 Fantasy League — Password Reset Code',
            text: `Your one-time password reset code is: ${token}\n\nThis code expires in 15 minutes.`,
        });
    } catch (error) {
        console.error('error sending reset email', error);
    }

    return res.send(genericResponse);
});

app.post('/resetInfo', validateResetInfo, handleValidationErrors, async (req,res) => {
    const email = req.body.email;
    const code = req.body.code;

    try {
        const userData = await pullResetToken(email);
        if (!userData || userData === -1 || userData.rows.length === 0) {
            return res.send("<h1> Inncorrect Code please Try Again </h1>");
        }

        const { reset_token, token_expiry, username } = userData.rows[0];

        if (!reset_token || new Date() > new Date(token_expiry)) {
            return res.send("<h1> Reset code has expired, please request a new one </h1>");
        }

        const hashedInput = crypto.createHash('sha256').update(code).digest('hex');
        const isValidCode = crypto.timingSafeEqual(Buffer.from(hashedInput), Buffer.from(reset_token));

        if (isValidCode) {
            await clearResetToken(username);
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



