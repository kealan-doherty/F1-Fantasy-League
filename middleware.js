
import { body, validationResult } from 'express-validator';
import { updatePts } from './public/SQL_functions.js';
import { pullDriverResults } from './public/pullRaceResults.js';

// check the user is signed in and if not signed in redirect to the landing page
export function requireAuth(req, res, next){
    if(req.session && req.session.user && req.session.user.username){
        return next();
    }

    return res.redirect('/');
}

// fetch the most recent race results and update the users points accordingly this will be called on a timer to ensure the users points are up to date.
export async function updateScore(){
    try{
        const response = await fetch("https://api.openf1.org/v1/session_result?session_key=latest&position<=10");
        const jsonContent = await response.json();
        const driverResults = pullDriverResults(jsonContent);
        await updatePts(driverResults);
    } catch (error){
        console.error('error updating users points', error);
    }
}
// this function will handle all validation errors for user input. 
export function handleValidationErrors(req, res, next){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const errorMessages = errors.array().map(err => err.msg);
        return res.status(400).json({errors: errorMessages});
    }
    next();
}

// validation for new user registration this will be used to ensure the user is entering valid data when creating a new account.
export const validateNewUser = [
    body('username').isLength({min: 3}).withMessage('Username must be at least 3 characters long'),
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('password').isLength({min: 8}).withMessage('Password must be at least 8 characters long'),
    body('passResetCode').isLength({min: 10}).withMessage('Password Reset code must be atleast 10 characters long'),
    body('confirmPassword').custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error('Passwords do not match');
        }
        return true;
    })
];

// validates user input for when they are sigining in. 
export const validateSignIn = [
    body('username').notEmpty().withMessage("Username field cannot be empty"),
    body('password').notEmpty().withMessage("Password field cannot be blank")
];

// validates user input for reseting their password.
export const validateResetInfo = [
    body('username').isLength({min: 3}).withMessage('Usernames must be atleast 3 characters long '),
    body('code').isLength({min:10}).withMessage('Password Reset code must be at least 10 characters long')
];

//validates user input for when they are reseting their password.
export const validatePasswordReset = [
    body('password').isLength({min: 8}).withMessage('Password must be at least 8 characters long'),
    body('confirmPassword').custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error('Passwords do not match');
        }
        return true;
    })
];  