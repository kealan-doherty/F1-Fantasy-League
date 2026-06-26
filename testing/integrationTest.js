import app from '../server.js';
import request from 'supertest';
import 'dotenv/config';
import { connectCache, redisClient } from '../caching/caching.js';
import { pool } from '../public/SQL_functions.js';
import { GenericContainer } from 'testcontainers';
import crypto from 'crypto';

afterAll(async () => {
    await pool.end();
});

describe('profile route', () => {
    test('redirects unauthenticated users to landing page', async () => {
        const response = await request(app).get('/profilePage');

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/');
    });
});

describe('sign-in route',() => {
    test('accepts valid creds', async () => {
        const response = await request(app)
            .post('/sign-in')
            .set('X-Forwarded-For', '10.0.0.1')
            .send({username: process.env.TEST_USERNAME,
                 password: process.env.TEST_PASSWORD
            });

        expect(response.status).toBe(200);

        const usernameResponse = await request(app)
            .get('/username')
            .set('Cookie', response.headers['set-cookie']);

        expect(usernameResponse.status).toBe(200);
    });

    test('rejects invalid creds', async () => {
        const response = await request(app)
            .post('/sign-in')
            .set('X-Forwarded-For', '10.0.0.2')
            .send({username: process.env.TEST_USERNAME,
                password: 'thisIsTheWrongPassword'
            });

            expect(response.status).toBe(401);
            expect(response.header['set-cookie']).toBeUndefined();
    })
});

describe('Global rate limiter', () => {
    test('blocks requests after limit is exceeded for global limit', async () => {
            for (let i = 0; i < 100; i++) {
                await request(app)
                    .get('/')
                    .set('X-Forwarded-For', '1.1.1.1');
            }
            const response = await request(app)
                .get('/')
                .set('X-Forwarded-For', '1.1.1.1');

            expect(response.status).toBe(429);
            expect(response.text).toContain('Too many requests from this IP, please try again after 15 minutes');
    })
});

describe('Auth rate limter', () => {
    test('blocks request after limit is exceeded for auth limit', async () => {
        for (let i = 0; i < 5; i++) {
            await request(app)
                .post('/sign-in')
                .set('X-Forwarded-For', '2.2.2.2')
                .send({
                    username: "testing this out",
                    password: "this will not work"
                });
        }

        const response = await request(app)
            .post('/sign-in')
            .set('X-Forwarded-For', '2.2.2.2')
            .send({
                username: "testing this out",
                password: "this will not work"
            });

            expect(response.status).toBe(429);
            expect(response.text).toContain('Too many login attempts from this IP, please try again after 15 minutes');
    });
});

describe('sign out route', () =>{
    test('test user is able to sign out correctly with the session destroyed and returned to the landing page', async () => {
        const agent = request.agent(app);
        const response = await agent
            .post('/sign-in')
            .set('X-Forwarded-For', '10.0.0.3')
            .send({username: process.env.TEST_USERNAME,
                   password: process.env.TEST_PASSWORD
            });
        
        // Confirm test user is signed in. 
        expect(response.status).toBe(200);

        //have test user sign out
        const signOut = await agent
            .post('/sign-out')
            .send()
            
        expect(signOut.status).toBe(200);
        
        //ensure signed out user is unable to go back to the profile page
        const profileAfterLogout = await agent.get('/profilePage');
        expect(profileAfterLogout.status).toBe(302);
        expect(profileAfterLogout.headers.location).toBe('/');

    });
});

describe('test caching', () => {
    let container;
    let canRunCacheTest = true;
    let skipReason = '';

    beforeAll(async () => {
        if (process.env.REDIS_URL) {
            return;
        }

        try {
            container = await new GenericContainer('redis:7.2-alpine')
                .withExposedPorts(6379)
                .start();

            const host = container.getHost();
            const port = container.getMappedPort(6379);
            process.env.REDIS_URL = `redis://${host}:${port}`;
        } catch (error) {
            canRunCacheTest = false;
            skipReason = 'Skipping Redis cache integration test: no container runtime found and REDIS_URL is not set.';
            console.warn(skipReason, error?.message || error);
        }
    }, 30000);

    afterAll(async () => {
        if (container) await container.stop();
    });

    beforeEach(async () => {
        if (!canRunCacheTest) {
            return;
        }

        await connectCache();
        if (redisClient.isOpen) {
            await redisClient.flushDb();
        }
    });

    test('caches leaderboard top 5 correctly', async () => {
        if (!canRunCacheTest) {
            expect(skipReason).toBeTruthy();
            return;
        }

        const agent = request.agent(app);
        const response = await agent
            .post('/sign-in')
            .set('X-Forwarded-For', '10.0.0.4')
            .send({username: process.env.TEST_USERNAME,
                   password: process.env.TEST_PASSWORD
            });

            // confirm test user is signed in 
            expect(response.status).toBe(200);

            //pull top 5 from the data base so cache as data to work with
            const firstResponse = await agent.get('/leaderboard/top5');
            expect(firstResponse.status).toBe(200);
            expect(Array.isArray(firstResponse.body.leaders)).toBe(true);
            expect(firstResponse.body.leaders.length).toBe(5);
            expect(firstResponse.body.meta.source).toBe('db');

            //ensure cache has data to pull
            const cacheData = await redisClient.get('leaderboard:top5');
            expect(cacheData).not.toBeNull();

            //parse cache data and esnure it is equal to data pulled from the db
            const parsedCache = JSON.parse(cacheData);
            expect(parsedCache).toEqual(firstResponse.body.leaders);

            // check subsequent calls return the same cached data
            const secondResponse = await agent.get('/leaderboard/top5');
            expect(secondResponse.status).toBe(200);
            expect(secondResponse.body.leaders).toEqual(firstResponse.body.leaders);
            expect(secondResponse.body.meta.source).toBe('cache');
    });
});


describe('test password reset logic', () => {
    test('blocks unathenticated users from reset confirm route', async () => {
        const response = await request(app)
            .post('/resetPasswordConfirm')
            .send({
                password: 'password',
                confirmPassword: 'password'
            });
            
            expect(response.status).toBe(401);
            expect(response.body).toMatchObject({
                error: 'Unauthorized'
            });
    });

    test('authenicated user is able to access the reset confirm route', async () => {
        const agent = request.agent(app)
        const response = await agent
            .post('/sign-in')
            .set('X-Forwarded-For', '10.0.0.5')
            .send({
                username: process.env.TEST_USERNAME,
                password: process.env.TEST_PASSWORD
            });

            expect(response.status).toBe(200);

            const resetResponse = await agent
                .post('/resetPasswordConfirm')
                .send({
                    password: 'newPassword',
                    confirmPassword: 'newPassword'
                });

            expect(resetResponse.status).toBe(200);
            expect(resetResponse.body).toMatchObject({
                message: 'Password updated successfully'
            });

            // return test user password to orginial password to not break other tests
            const resetPassword = await agent
                .post('/resetPasswordConfirm')
                .send({
                    password: process.env.TEST_PASSWORD,
                    confirmPassword: process.env.TEST_PASSWORD
                });
            
            expect(resetPassword.status).toBe(200);
    });

    test('password is too short for authenicated user', async () =>{
        const agent = request.agent(app)
        const response = await agent
            .post('/sign-in')
            .set('X-Forwarded-For', '10.0.0.6')
            .send({
                username: process.env.TEST_USERNAME,
                password: process.env.TEST_PASSWORD
            });

            expect(response.status).toBe(200);

        const resetPassword = await agent
            .post('/resetPasswordConfirm')
            .send({
                password: 'fail',
                confirmPassword: 'fail' 
            });

            expect(resetPassword.status).toBe(400);
            expect(resetPassword.body).toMatchObject({
                errors: expect.arrayContaining(['Password must be at least 8 characters long'])
            });

        const resetPasswordMisMatch = await agent
            .post('/resetPasswordConfirm')
            .send({
                password: 'hellothere',
                confirmPassword: 'hellotheir'
            });

            expect(resetPasswordMisMatch.status).toBe(400)
            expect(resetPasswordMisMatch.body).toMatchObject({
                errors: expect.arrayContaining(['Passwords do not match'])
            });
    });
});

describe('test /resetInfo', () => {
    test('invalid email format', async () =>{
        const response = await request(app)
            .post('/resetInfo')
            .set('X-Forwarded-For', '10.0.0.7')
            .send({
                email: 'this is not a valid email',
                code: process.env.TEST_CODE_FOR_EMAIL_VALIDATION
            });

            expect(response.status).toBe(400);
    });

    test('invalid code format', async () => {
        const invalidCode = await request(app)
            .post('/resetInfo')
            .set('X-Forwarded-For', '10.0.0.8')
            .send({
                email:'cool@gmail.com',
                code: 'not a cool code'
            });

            expect(invalidCode.status).toBe(400);
    });
});

describe('test /resetInfo with valid inputs', () => {
    let testEmail;

    beforeAll(async () => {
        const result = await pool.query(
            'SELECT email FROM public.user_info WHERE username = $1',
            [process.env.TEST_USERNAME] 
        );
        expect(result.rows.length).toBe(1);
        testEmail = result.rows[0].email;
    });

    afterEach(async () => {
        await pool.query(
            'UPDATE public.user_info SET reset_token = NULL, token_expiry = NULL WHERE email = $1',
            [testEmail]
        );
    });
    test('valid format but wrong code', async () => {
        const realCode = 'a'.repeat(64);
        const wrongCode = 'b'.repeat(64);
        const hashedRealCode = crypto.createHash('sha256').update(realCode).digest('hex');

        await pool.query(
            'UPDATE public.user_info SET reset_token = $1, token_expiry = $2 WHERE email = $3',
            [hashedRealCode, new Date(Date.now() + 10 * 60 * 1000), testEmail ]
        );
        
        const response = await request(app)
            .post('/resetInfo')
            .set('X-Forwarded-For', '3.3.3.3')
            .send({
                email: testEmail,
                code: wrongCode
            });

        expect(response.status).toBe(400);
        expect(response.body).toMatchObject({
            error: 'Invalid reset code'
        });
    });
});

