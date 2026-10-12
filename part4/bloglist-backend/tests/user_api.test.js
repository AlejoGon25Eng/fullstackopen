const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')
const app = require('../app')
const helper = require('./test_helper')
const User = require('../models/user')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    await new User({ username: 'root', passwordHash }).save()
  })

  // 4.15
  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    await api
      .post('/api/users')
      .send({ username: 'mluukkai', name: 'Matti Luukkainen', password: 'salainen' })
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
    assert(usersAtEnd.map(u => u.username).includes('mluukkai'))
  })

  test('the password hash is never returned', async () => {
    const response = await api.get('/api/users').expect(200)
    assert.strictEqual(response.body[0].passwordHash, undefined)
    assert.strictEqual(response.body[0].password, undefined)
  })

  // 4.16
  test('creation fails with 400 if username is already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const result = await api
      .post('/api/users')
      .send({ username: 'root', name: 'Superuser', password: 'salainen' })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('expected `username` to be unique'))

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with 400 if username is missing', async () => {
    const usersAtStart = await helper.usersInDb()

    await api.post('/api/users').send({ password: 'salainen' }).expect(400)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with 400 if password is missing', async () => {
    const usersAtStart = await helper.usersInDb()

    await api.post('/api/users').send({ username: 'newuser' }).expect(400)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with 400 if username is shorter than 3 characters', async () => {
    const usersAtStart = await helper.usersInDb()

    const result = await api
      .post('/api/users')
      .send({ username: 'ab', password: 'salainen' })
      .expect(400)

    assert(result.body.error.includes('at least 3 characters'))

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with 400 if password is shorter than 3 characters', async () => {
    const usersAtStart = await helper.usersInDb()

    const result = await api
      .post('/api/users')
      .send({ username: 'newuser', password: 'ab' })
      .expect(400)

    assert(result.body.error.includes('at least 3 characters'))

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

describe('login', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('sekret', 10)
    await new User({ username: 'root', passwordHash }).save()
  })

  // 4.18
  test('succeeds with correct credentials and returns a token', async () => {
    const response = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })
      .expect(200)

    assert.ok(response.body.token)
    assert.strictEqual(response.body.username, 'root')
  })

  test('fails with 401 with a wrong password', async () => {
    await api
      .post('/api/login')
      .send({ username: 'root', password: 'wrong' })
      .expect(401)
  })
})

after(async () => {
  await mongoose.connection.close()
})
