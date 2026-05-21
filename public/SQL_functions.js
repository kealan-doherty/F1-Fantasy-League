import 'dotenv/config';
import { Pool } from 'pg';

 export const pool = new Pool({
        connectionString: process.env.DB_URL
    });

export async function connectDb(){
    try {
        const client = await pool.connect();
        client.release();
        console.log("Connected to database");
    } catch (err) {
        console.error("error connecting to the database", err);
        return -1;
    }


}

export async function disconnectDB(){
    try{
        await pool.end();
    } catch(error){
        console.error('Failed to disconnect from the Database', error);
    }

    console.log('disconnected from the Database');
}
    
export async function createNewUser(username, password, email){
    const insertQuery = 'INSERT INTO public.user_info (username, password, email, points) VALUES ($1, $2, $3, 0)';
    const values = [username, password, email];

    try{
        const insertRes = await pool.query(insertQuery, values);
        return insertRes.rowCount;
    } catch (error){
        console.error("Error creating profile", error);
        return -1;
    }
}

export async function pullUserData(username){
    const values = [username];
    const selectQuery = 'SELECT password FROM public.user_info WHERE username = $1';

    try{
        const selectRes = await pool.query(selectQuery, values);
        return selectRes;
    }
    catch (error) {
        console.error("Error pulling user data", error);
        return -1;
    }
}

export async function updateDrivers(username, driver_one, driver_two){
    const values = [driver_one, driver_two, username]; 
    const updateQuery = `UPDATE public.user_info SET first_driver = $1, second_driver = $2 WHERE username = $3`;

    try {
        const updateRes = await pool.query(updateQuery, values);
        return updateRes.rowCount; 
    } catch (error) {
        console.error("Error updating drivers:", error);
        return -1; 
    }
}

export async function updateConstructor(username, newConstructor){
    const values = [newConstructor, username];
    const updateQuery = 'UPDATE public.user_info SET constructor = $1 WHERE username = $2';

    try{
        const updateRes = await pool.query(updateQuery,values);
        return updateRes.rowCount;
    } catch (error){ER_INFO
        console.error("error updating the constructor", error);
        return -1;
    }
    
}

export async function pullTeam(username){
    const values = [username];
    const selectQuery = 'SELECT username, first_driver, second_driver, constructor FROM public.user_info WHERE username = $1';

    try{
        const selectRes = await pool.query(selectQuery, values);
        return selectRes;
    } catch (error) {
        console.error("error pulling team data", error);
        return -1;
    }   
}
    
export async function updatePts(driverResults){
    // ensure this function is working correctly!!!
    const updateQueryOne = 'UPDATE public.user_info set points = points + $2 WHERE first_driver = $1';
    const updateQueryTwo = 'UPDATE public.user_info set points = points + $2 WHERE second_driver = $1';
        try{
            for (const key in driverResults){
                const values = [key,driverResults[key]];
                const updatePtsOne = await pool.query(updateQueryOne,values);
                const updatePtsTwo = await pool.query(updateQueryTwo,values);
            }
    } catch (error) {
        console.error('error updating user race results', error);
        return -1;
    }
   
}

export async function storeResetToken(email, hashedToken, expiry){
    const values = [hashedToken, expiry, email];
    const updateQuery = 'UPDATE public.user_info SET reset_token = $1, token_expiry = $2 WHERE email = $3';

    try{
        const updateRes = await pool.query(updateQuery, values);
        return updateRes.rowCount;
    } catch (error) {
        console.error("error storing reset token", error);
        return -1;
    }
}

export async function pullResetToken(email){
    const values = [email];
    const selectQuery = 'SELECT reset_token, token_expiry, username FROM public.user_info WHERE email = $1';

    try{
        const selectRes = await pool.query(selectQuery, values);
        return selectRes;
    } catch (error) {
        console.error("error pulling reset token", error);
        return -1;
    }
}

export async function clearResetToken(username){
    const values = [username];
    const updateQuery = 'UPDATE public.user_info SET reset_token = NULL, token_expiry = NULL WHERE username = $1';

    try{
        const updateRes = await pool.query(updateQuery, values);
        return updateRes.rowCount;
    } catch (error) {
        console.error("error clearing reset token", error);
        return -1;
    }
}

export async function updatePassword(username, hashedPassowrd){
    const values = [hashedPassowrd,username];
    const updateQuery = 'UPDATE public.user_info set password = $1 WHERE username = $2';

    try{
        const UpdateRes = await pool.query(updateQuery,values);
        return UpdateRes.rowCount;
    } catch (error){
        console.error("error updating password:", error);
        return -1;
    }
}

