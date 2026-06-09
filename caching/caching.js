import { createClient } from "redis";
import 'dotenv/config';

// create redis client for all users
export const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.error('Redis Client error', err));

export async function connectCache() {
    // function to allow the api to connect to the cahce
    try {
        if (redisClient.isOpen) {
            console.log('connected to redis cache');
            return redisClient;
        } else {
            await redisClient.connect();
            console.log('connected to redis cache');
            return redisClient;
        }

    } catch (error) {
        console.error('error connecting to the redis cache', error);
        return -1;
    }
}
