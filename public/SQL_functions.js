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
    const insertQuery = 'INSERT INTO public."USER INFO" (username, password) VALUES ($1, $2)'

    const values = [username, password];

    const insertRes = client.query(insertQuery, values);
}

export function pullUserData(username){
    const values = [username];
    const selectQuery = 'SELECT password FROM public."USER INFO" WHERE username = $1';
    const selectRes = client.query(selectQuery, values);
    return selectRes;
    }

export function updateDrivers(username, newDrviers){

}

export function updateConstrcutor(username, newConstructor){
    const values = [useranme, newConstructor];
    const UpdateQuery = 'UPDATE Constructor FROM public."USER INFO" WHERE username = $1'
}

export function pullTeam(username){
    const values = [username];
    const selectQuery = 'SELECT first_driver, second_driver, constructor FROM public."USER INFO" WHERE username = $1';
    const selectRes = client.query(selectQuery, values);
    return selectRes;
}
