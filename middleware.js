

// check the user is signed in and if not signed in redirect to sign in page
export async function requireAuth(req, res, next){
    if(req.session && req.session.user && req.session.user.username){
        next();
    } else {
        res.redirect('/sign-in');
    }
}

// fetch the most recent race results and update the users points accordingly this will be called on a timer to ensure the users points are up to date.
export async function updateScore(){
    fetch("https://api.openf1.org/v1/session_result?session_key=latest&position<=10")
        .then((response) => response.json())
        .then((jsonContent) => {
            try{
                const driverResults = pullDriverResults(jsonContent);
                updatePts(driverResults);
            } catch (error){
                console.error('error updating users points');
            }
        });
}