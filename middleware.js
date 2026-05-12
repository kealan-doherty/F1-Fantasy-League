
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