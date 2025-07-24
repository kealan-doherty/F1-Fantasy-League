import 'dotenv/config';
import { Client } from 'pg';

const key = process.env.DB_KEY;
const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const name = process.env.DB_NAME;

export function connectDb(){
    const client = new Client({
        user: user,
        host: host,
        database: name,
        password: key,
        port: 5432,
    })


    client.connect()
        .then(() => console.log("Connected to database"))
        .catch(err => console.error("error connecting to the database", err));

}



function createUserTable(){
    connectDb();
    

}
