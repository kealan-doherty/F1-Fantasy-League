import 'dotenv/config';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import cron from 'node-cron';
import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDb, createNewUser, pullUserData, pullTeam, updateConstructor, updateDrivers, updatePts, pullUserCode } from './public/SQL_functions.js';
import { convertPosToPts } from './public/pullRaceResults.js';
import { genPasswordToken } from './generatePasswordToken.js';
import { updatePassword } from './public/SQL_functions.js';
import { updateScore, requireAuth} from './middleware.js';

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
    cookie: {secure: false, httpOnly: true, maxAge: 360000}
}));

connectDb();
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'public','index.html'));
});

app.post('/submit', async (req, res) => {
    const data = req.body;
    const username = data.username;
    if(data.password != data.confirmPassword){
        res.send('<h1> Error Passwords Do not match Please try again</h1>');
    }

    const hashedPassowrd = await bcrypt.hash(data.password, 10); 
    const hashedEmail = await bcrypt.hash(data.email, 10);
    const hashedCode = await bcrypt.hash(data.passResetCode,10);

    createNewUser(username,hashedPassowrd, hashedEmail,hashedCode);
    req.session.user = {username: username};
    req.session.save();
    res.sendFile('alterTeam.html', {root: path.join(__dirname, 'public')});
    
});

app.post('/resetPasswordConfirm', requireAuth, async (req,res) => {
    const data = req.body;
    const username = req.session.user.username;
    if(data.password != data.confirmPassword){
        res.send('<h1> ERROR PASSWORDS DO NOT MATCH </h1>');
    }
    const hashedPassowrd = await bcrypt.hash(data.password,10);
    await updatePassword(username, hashedPassowrd);
    res.send('<h1> Password successfully changed please return to login screen </h1>');
    
})

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
        await updateConstrcutor(username, newConstructor);
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

app.post('/resetInfo', requireAuth, async (req,res) => {
    console.log('hi');
    // while app isn't deployed reset password will be now via a code entered by the user Once
    // app is deployed I will fully correct to have industy standard reset function 
   
    const username = req.body.username;
    console.log(username);
    const code = req.body.code;
    const hashedCode = await bcrypt.hash(code,10);
    const userData = await pullTeam(username); 
    const pulledCode = userData.rows[0].code;

   // try{
     //   if(await bcrypt.compare(data = code, hashedcode = pulledCode) == true){
       // req.session.user = {username: username};
       // req.session.save();
       // res.redirect('/updatePassword');
    //} 
   // } catch(error){
   //     console.error('eror confirming code', error);
   // }
});

cron.schedule('0 18 * * 1', () => {
    updateScore();
})

app.listen(3000, () => {
    console.log("server is up and running");
});



