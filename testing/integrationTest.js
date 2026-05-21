import app from '../server.js';
import request from 'supertest';
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

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/profilePage');
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



