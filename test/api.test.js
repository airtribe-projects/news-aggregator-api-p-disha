const tap = require('tap');
const supertest = require('supertest');
const app = require('../app');
const server = supertest(app);

const mockUser = {
    name: 'Clark Kent',
    email: 'clark@superman.com',
    password: 'Krypt()n8',
    preferences: ['movies', 'comics']
};

let token = '';
let refreshToken = '';

// Auth tests

tap.test('POST /users/signup', async (t) => {
    const response = await server.post('/users/signup').send(mockUser);
    t.equal(response.status, 200);
    t.end();
});

tap.test('POST /users/signup with weak password', async (t) => {
    const response = await server.post('/users/signup').send({
        name: 'Weak User',
        email: 'weak@user.com',
        password: '123'
    });
    t.equal(response.status, 400);
    t.match(response.body.message, /Password must be/);
    t.end();
});

tap.test('POST /users/signup with invalid email', async (t) => {
    const response = await server.post('/users/signup').send({
        name: 'Bad Email',
        email: 'notanemail',
        password: 'StrongPassword1!'
    });
    t.equal(response.status, 400);
    t.match(response.body.message, /Invalid email/);
    t.end();
});

tap.test('POST /users/login', async (t) => {
    const response = await server.post('/users/login').send({
        email: mockUser.email,
        password: mockUser.password
    });
    t.equal(response.status, 200);
    t.hasOwnProp(response.body, 'token');
    t.hasOwnProp(response.body, 'refreshToken');
    token = response.body.token;
    refreshToken = response.body.refreshToken;
    t.end();
});

tap.test('POST /users/refresh', async (t) => {
    const response = await server.post('/users/refresh').send({
        token: refreshToken
    });
    t.equal(response.status, 200);
    t.hasOwnProp(response.body, 'token');
    // Update token to use the refreshed one for subsequent tests
    token = response.body.token;
    t.end();
});

tap.test('POST /users/login with wrong password', async (t) => {
    const response = await server.post('/users/login').send({
        email: mockUser.email,
        password: 'wrongpassword'
    });
    t.equal(response.status, 401);
    t.end();
});

// Preferences tests

tap.test('GET /users/preferences', async (t) => {
    const response = await server.get('/users/preferences').set('Authorization', `Bearer ${token}`);
    t.equal(response.status, 200);
    t.hasOwnProp(response.body, 'preferences');
    t.same(response.body.preferences, mockUser.preferences);
    t.end();
});

tap.test('GET /users/preferences without token', async (t) => {
    const response = await server.get('/users/preferences');
    t.equal(response.status, 401);
    t.end();
});

tap.test('PUT /users/preferences', async (t) => {
    const response = await server.put('/users/preferences').set('Authorization', `Bearer ${token}`).send({
        preferences: ['movies', 'comics', 'games']
    });
    t.equal(response.status, 200);
});

// News tests

tap.test('GET /news', async (t) => {
    const response = await server.get('/news').set('Authorization', `Bearer ${token}`);
    t.equal(response.status, 200);
    t.hasOwnProp(response.body, 'news');
    t.end();
});

tap.teardown(() => {
    process.exit(0);
});
