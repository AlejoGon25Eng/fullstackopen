const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

const newBlog = {
  title: 'Type wars',
  author: 'Robert C. Martin',
  url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
  likes: 2
}

const loginAs = async (username, password) => {
  const response = await api
    .post('/api/login')
    .send({ username, password })
    .expect(200)
  return response.body.token
}

describe('when there are initially some blogs saved', () => {
  let token

  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    await new User({ username: 'root', name: 'Root', passwordHash }).save()
    token = await loginAs('root', 'sekret')

    await Blog.insertMany(helper.initialBlogs)
  })

  // 4.8
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  // 4.9
  test('the unique identifier property is named id', async () => {
    const response = await api.get('/api/blogs')
    const blog = response.body[0]
    assert.ok(blog.id)
    assert.strictEqual(blog._id, undefined)
  })

  describe('addition of a new blog', () => {
    // 4.10 y 4.23
    test('succeeds with valid data and a token', async () => {
      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
      assert(blogsAtEnd.map(b => b.title).includes('Type wars'))
    })

    test('assigns the logged in user as creator', async () => {
      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)

      // el usuario llega poblado (id, username y name), no solo el id
      const users = await helper.usersInDb()
      assert.strictEqual(response.body.user.id, users[0].id)
      assert.strictEqual(response.body.user.username, 'root')
    })

    // 4.23
    test('fails with 401 if no token is provided', async () => {
      await api.post('/api/blogs').send(newBlog).expect(401)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('fails with 401 if the token is invalid', async () => {
      await api
        .post('/api/blogs')
        .set('Authorization', 'Bearer not-a-real-token')
        .send(newBlog)
        .expect(401)
    })

    // 4.11
    test('likes defaults to 0 when missing', async () => {
      const { likes, ...withoutLikes } = newBlog

      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(withoutLikes)
        .expect(201)

      assert.strictEqual(response.body.likes, 0)
    })

    // 4.12
    test('fails with 400 if title is missing', async () => {
      const { title, ...withoutTitle } = newBlog

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(withoutTitle)
        .expect(400)
    })

    test('fails with 400 if url is missing', async () => {
      const { url, ...withoutUrl } = newBlog

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(withoutUrl)
        .expect(400)
    })
  })

  describe('deletion of a blog', () => {
    // 4.13 y 4.21
    test('succeeds with 204 when done by the creator', async () => {
      const created = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)

      await api
        .delete(`/api/blogs/${created.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
      assert(!blogsAtEnd.map(b => b.id).includes(created.body.id))
    })

    test('fails with 401 without a token', async () => {
      const blogsAtStart = await helper.blogsInDb()

      await api.delete(`/api/blogs/${blogsAtStart[0].id}`).expect(401)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })

    test('fails with 403 when done by another user', async () => {
      const created = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)

      const passwordHash = await bcrypt.hash('other', 10)
      await new User({ username: 'other', passwordHash }).save()
      const otherToken = await loginAs('other', 'other')

      await api
        .delete(`/api/blogs/${created.body.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
    })

    test('fails with 400 if the id is malformatted', async () => {
      await api
        .delete('/api/blogs/not-an-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(400)
    })
  })

  describe('updating a blog', () => {
    // 4.14
    test('succeeds in changing the likes', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send({ ...blogToUpdate, likes: blogToUpdate.likes + 10 })
        .expect(200)

      assert.strictEqual(response.body.likes, blogToUpdate.likes + 10)

      const blogsAtEnd = await helper.blogsInDb()
      const updated = blogsAtEnd.find(b => b.id === blogToUpdate.id)
      assert.strictEqual(updated.likes, blogToUpdate.likes + 10)
    })

    // 5.9
    test('returns the creator user data after a like', async () => {
      const created = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)

      const response = await api
        .put(`/api/blogs/${created.body.id}`)
        .send({ ...newBlog, likes: 3, user: created.body.user.id })
        .expect(200)

      assert.strictEqual(response.body.likes, 3)
      assert.strictEqual(response.body.user.username, 'root')
    })

    test('fails with 404 if the blog does not exist', async () => {
      await api
        .put('/api/blogs/64b7f0f2f2f2f2f2f2f2f2f2')
        .send(newBlog)
        .expect(404)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})
