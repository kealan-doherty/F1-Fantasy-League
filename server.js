import 'dotenv/config';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import cron from 'node-cron';
import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { connectDb, createNewUser, pullUserData, pullTeam, updateConstructor, updateDrivers, updatePts, storeResetToken, pullResetToken, clearResetToken, pool, pullLeaderBoard } from './public/SQL_functions.js';
import { updatePassword } from './public/SQL_functions.js';
import { updateScore, requireAuth, validateNewUser, validateSignIn, handleValidationErrors, validateResetInfo, validatePasswordReset } from './middleware.js';
import { genPasswordToken } from './generatePasswordToken.js';
import { globalLimiter, authLimiter } from './rateLimiting/rateLimiter.js';
import { connectCache, redisClient } from './caching/caching.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
export default app;

const PgSession = connectPgSimple(session);

const secret = process.env.SESSION_SECRET;

app.set('trust proxy', 1);
app.use(globalLimiter);
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    store: process.env.NODE_ENV === 'test' ? undefined : new PgSession({
        pool: pool,
        tableName: 'user_sessions',
    }),
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: {secure: process.env.NODE_ENV === 'production', httpOnly: true, maxAge: 3600000}
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
    if (!req.is('application/json')) {
        return res.status(415).json({
            error: 'Unsupported media type',
            message: 'Use application/json for this endpoint.',
        });
    }

    const data = req.body;
    const username = data.username;
    const email = data.email;

    try {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        await createNewUser(username, hashedPassword, email);
        req.session.user = { username: username };
        req.session.save();

        return res.status(201).json({
            message: 'Account created successfully',
            username: username,
        });

    } catch (error) {
        console.error('error creating user account', error);

        return res.status(500).json({
            error: 'Account creation failed',
            message: 'Unable to create account at this time. Please try again later.',
        });
    }
    
});

app.post('/resetPasswordConfirm', requireAuth, validatePasswordReset, handleValidationErrors, async (req,res) => {
    const data = req.body;
    const username = req.session.user.username;
    
    const hashedPassowrd = await bcrypt.hash(data.password,10);
    await updatePassword(username, hashedPassowrd);
    return res.status(200).json({
        message: 'Password updated successfully',
    });
    
});

app.post('/sign-in', authLimiter, validateSignIn, handleValidationErrors, async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    const userData = await pullUserData(username);
    if (!userData || userData === -1 || userData.rows.length === 0) {
        return res.status(401).json({
            error: 'Incorrect username or password',
            message: 'Incorrect username or password, please try again'
        });
    }
    const pulledPassword = userData.rows[0].password;
    
    if (await bcrypt.compare(password, pulledPassword)) {
         req.session.user = {username: username};
         req.session.save();
         return res.status(200).json({
             message: 'Login successful',
             username: username,
         });
    } else {
         return res.status(401).json({
             error: 'Incorrect username or password',
             message: 'Incorrect username or password, please try again'
         });
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
        res.status(200).json(data);
    }catch (error){
        console.error('error sending teams data', error);
    }
});

app.post('/updateTeam', requireAuth, async (req,res) => {
    if (!req.is('application/json')) {
        return res.status(415).json({
            error: 'Unsupported media type',
            message: 'Use application/json for this endpoint.',
        });
    }

    const username = req.session.user.username;
    const newDriverOne = req.body.first_driver;
    const newDriverTwo = req.body.second_driver;
    const newConstructor = req.body.constructor;

    try{
        await updateConstructor(username, newConstructor);
        await updateDrivers(username, newDriverOne, newDriverTwo);

        return res.status(200).json({
            message: 'Team updated successfully',
        });
        
    } catch (err){
        console.error("error occured in updating team", err.message);

        return res.status(500).json({
            error: 'Team update failed',
            message: 'Unable to update team at this time. Please try again later.',
        });
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

app.post('/requestReset', authLimiter, async (req, res) => {
    const email = req.body.email;
    const genericResponse = '<h1> If that email address is registered, a reset code has been sent to it </h1>';

    try {
        const { token, hashedToken } = await genPasswordToken();
        const expiry = new Date(Date.now() + 15 * 60 * 1000);

        const result = await storeResetToken(email, hashedToken, expiry);
        if (!result || result === -1 || result === 0) {
            return res.status(200).json({
                message:"reset token has been stored"
            })
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

    return res.status(200).json({
        message: 'Reset Code has been Sent to your Email.'
    });
});

app.post('/resetInfo', authLimiter, validateResetInfo, handleValidationErrors, async (req,res) => {
    const email = req.body.email;
    const code = req.body.code;

    try {
        const userData = await pullResetToken(email);
        if (!userData || userData === -1 || userData.rows.length === 0) {
            return res.status(400).json({
                error: 'Invalid reset code',
                message: 'The reset code is incorrect. Please try again.'
            });
        }

        const { reset_token, token_expiry, username } = userData.rows[0];

        if (!reset_token || new Date() > new Date(token_expiry)) {
            return res.status(400).json({
                error: 'Invalid or expired reset code',
                message: 'The reset code is invalid or has expired. Please request a new one.'
            });
        }

        const hashedInput = crypto.createHash('sha256').update(code).digest('hex');
        const isValidCode = crypto.timingSafeEqual(Buffer.from(hashedInput), Buffer.from(reset_token));

        if (isValidCode) {
            await clearResetToken(username);
            req.session.user = {username: username};
            req.session.save();
            return res.status(200).json({
                message: 'Reset Code has been verified'
            });
        }

        return res.status(400).json({
            error: 'Invalid reset code',
            message: 'The reset code is incorrect. Please try again.'
        });
    } catch(error) {
        console.error('error confirming code', error);
        return res.status(500).json({
            error: 'Error confirming reset code',
            message: 'An error occurred while confirming the reset code. Please try again later.'
        });
    }
});

app.get('/leaderboard/top5', requireAuth, async (req,res) => {

    try {
        const key = 'leaderboard:top5';
        const ttlSeconds = 120;

        await connectCache();
        const cached = await redisClient.get(key);

        if (cached) {
            return res.status(200).json({
                leaders: JSON.parse(cached),
                meta: {
                    limit: 5,
                    source: 'cache',
                },
            });
        }

        const leaders = await pullLeaderBoard();
        if (leaders === -1) {
            return res.status(500).json({
                error: 'Leaderboard fetch failed',
                message: 'Unable to fetch leaderboard at this time.',
            });
        }

        await redisClient.setEx(key, ttlSeconds, JSON.stringify(leaders));

        return res.status(200).json({
            leaders: leaders,
            meta: {
                limit: 5,
                source: 'db',
            },
        });
    } catch (error) {
        console.error('error pulling leaderboard data', error);
        return res.status(500).json({
            error: 'Leaderboard fetch failed',
            message: 'Unable to fetch leaderboard at this time.',
        });
    }
});

app.post('/sign-out', requireAuth, (req,res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('error destroying session during sign out', err);
            return res.status(500).json({
                error: 'Sign out failed',
                message: 'An error occurred while signing out. Please try again later.',
            });
        }
        res.clearCookie('connect.sid', { path: '/' });
        return res.status(200).json({
            message: 'Sign out successful',
        });
    });
});

if (process.env.NODE_ENV !== 'test') {
    cron.schedule('0 18 * * 0', () => {
        updateScore();
    });
}

if (process.env.NODE_ENV !== 'test'){
    app.listen(3000, () => {
        console.log("server is up and running");
    });
}



