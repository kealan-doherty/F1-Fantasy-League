import 'dotenv/config';
import { Pool } from 'pg';

const key = process.env.DB_KEY;
const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const name = process.env.DB_NAME;

 export const pool = new Pool({
        user: user,
        host: host,
        database: name,
        password: key,
        port: 5432,
    })


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
    
export async function createNewUser(username,password, email,code){
    const insertQuery = 'INSERT INTO public."USER INFO" (username, password, email, code) VALUES ($1, $2, $3, $4)';
    const intitPts = 'UPDATE public."USER INFO" set points = 0 WHERE username = $1';
    const values = [username, password, email, code];
    const user = [username];

    try{
        const insertRes = await pool.query(insertQuery, values);
        const ptsRes = await pool.query(intitPts, user);
        return insertRes.rowCount;
    } catch (error){
        console.error("Error creating profile", error);
        return -1;
    }
}

export async function pullUserData(username){
    const values = [username];
    const selectQuery = 'SELECT password FROM public."USER INFO" WHERE username = $1';

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
    const updateQuery = `UPDATE public."USER INFO" SET first_driver = $1, second_driver = $2 WHERE username = $3`;

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
    const updateQuery = 'UPDATE public."USER INFO" SET constructor = $1 WHERE username = $2';

    try{
        const updateRes = await pool.query(updateQuery,values);
        return updateRes.rowCount;
    } catch (error){
        console.error("error updating the constructor", error);
        return -1;
    }
    
}

export async function pullTeam(username){
    const values = [username];
    const selectQuery = 'SELECT * FROM "USER INFO" WHERE username = $1';

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
    const updateQueryOne = 'UPDATE public."USER INFO" set points = points + $2 WHERE first_driver = $1';
    const updateQuertTwo = 'UPDATE public."USER INFO" set points = points + $2 WHERE second_driver = $1';
        try{
            for (const key in driverResults){
                const values = [key,driverResults[key]];
                const updatePtsOne = await pool.query(updateQueryOne,values);
                const updatePtstwo = await pool.query(updateQuertTwo,values);
            }
    } catch (error) {
        console.error('error updating user race results', error);
        return -1;
    }
   
}

export async function pullUserCode(email){
    const values = [email];
    const selectQuery = 'SELECT * FROM "USER INFO" WHERE email = $1';

    try{
        const selectRes = await pool.query(selectQuery, values);
        return selectRes
    } catch (error) {
        console.error("error pulling user code", error);
        return -1;
    }

}

export async function updatePassword(username, hashedPassowrd){
    const values = [hashedPassowrd,username];
    const updateQuery = 'UPDATE public."USER INFO" set password = $1 WHERE username = $2';

    try{
        const UpdateRes = await pool.query(updateQuery,values);
        return UpdateRes.rowCount;
    } catch (error){
        console.error("error updating password:", error);
        return -1;
    }
}

