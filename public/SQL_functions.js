import 'dotenv/config';
import { Client, Pool } from 'pg';

const key = process.env.DB_KEY;
const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const name = process.env.DB_NAME;

 export const client = new Client({
        user: user,
        host: host,
        database: name,
        password: key,
        port: 5432,
    })


export function connectDb(){
    
    client.connect()
        .then(() => console.log("Connected to database"))
        .catch(err => console.error("error connecting to the database", err));


}

export function disconnectDB(){
    try{
        client.end();
    } catch(error){
        console.error('Failed to disconnect from the Database', error);
    }

    console.log('disconnected from the Database');
}
    

export function createNewUser(username,password){
    const insertQuery = 'INSERT INTO public."USER INFO" (username, password) VALUES ($1, $2)';
    const intitPts = 'UPDATE public."USER INFO" set points = 0 WHERE username = $1';
    const values = [username, password];
    const user = [username];
    try{
        const insertRes = client.query(insertQuery, values);
        const ptsRes = client.query(intitPts, user);
        return insertRes.rowCount;
    } catch (error){
        console.error("Error creating profile", error);
        return -1;
    }
}

export function pullUserData(username){
    const values = [username];
    const selectQuery = 'SELECT password FROM public."USER INFO" WHERE username = $1';
    const selectRes = client.query(selectQuery, values);
    return selectRes;
    }

export  async function updateDrivers(username, driver_one, driver_two){
    const values = [driver_one, driver_two, username]; 
    const updateQuery = `UPDATE public."USER INFO" SET first_driver = $1, second_driver = $2 WHERE username = $3`;
    try {
        const updateRes = await client.query(updateQuery, values);
        return updateRes.rowCount; 
    } catch (error) {
        console.error("Error updating drivers:", error);
        return -1; 
    }
}


export function updateConstrcutor(username, newConstructor){
    const values = [newConstructor, username];
    const updateQuery = 'UPDATE public."USER INFO" SET constructor = $1 WHERE username = $2';
    try{
        const updateRes = client.query(updateQuery,values);
        return updateRes.rowCount;
    } catch (error){
        console.error("error updating the constructor", error);
        return -1;
    }
    
}

export function pullTeam(username){
    const values = [username];
    const selectQuery = 'SELECT * FROM "USER INFO" WHERE username = $1';
    const selectRes = client.query(selectQuery, values);
    console.log(selectRes);
    return selectRes;
}

export function updatePts(){
    // this function will update driver by driver and evenutally team by team to 
    // make this function easier to test and to simplify the SQL queries. 

    const updateQuery = 'UPDATE public."USER INFO" set points = points + 1 WHERE first_driver = "Max_Verstappen"';
    try{
        const updatePts = client.query(updateQuery);
        return updatePts.rowCount;
    } catch (error){
        console.error('error updating frist drivers points', error);
        return -1;
    }
}


