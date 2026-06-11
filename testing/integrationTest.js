import app from '../server.js';
import request from 'supertest';
import { connectCache } from '../caching/caching.js';
import { pool } from '../public/SQL_functions.js';

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
            .send({username: 'testuser',
                 password: 'TestPassword123!'
            });

        expect(response.status).toBe(200);
    });
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
            .send({username: 'testuser',
                   password: 'TestPassword123!'
            });

        expect(response.status).toBe(200);

        const signOut = await agent
            .post('/sign-out')
            .send()

        expect(signOut.status).toBe(200);

        const profileAfterLogout = await agent.get('/profilePage');

        expect(profileAfterLogout.status).toBe(302);
        expect(profileAfterLogout.headers.location).toBe('/');

    });
});

describe('test caching'), () => {
    test('test caching feature for top 5 with a dummy data set', async () => { 

    });
}