const { test, expect, beforeEach, describe } = require('@playwright/test')
const { resetDb, createUser, loginWith, createBlog } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    // 5.18: vaciar la base de datos y crear un usuario
    await resetDb(request)
    await createUser(request, {
      name: 'Matti Luukkainen',
      username: 'mluukkai',
      password: 'salainen'
    })

    await page.goto('/')
  })

  // 5.17
  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('Log in to application')).toBeVisible()
    await expect(page.getByTestId('username')).toBeVisible()
    await expect(page.getByTestId('password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  // 5.18
  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')

      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'wrong')

      const notification = page.locator('.notification')
      await expect(notification).toContainText('wrong username or password')
      await expect(notification).toHaveCSS('color', 'rgb(255, 0, 0)')
      await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
    })

    // 5.19
    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, {
        title: 'A blog created by playwright',
        author: 'Playwright',
        url: 'https://playwright.dev'
      })

      await expect(
        page.locator('.blog').filter({ hasText: 'A blog created by playwright' })
      ).toBeVisible()
    })

    describe('and a blog exists', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, {
          title: 'First blog',
          author: 'Author One',
          url: 'https://example.com/1'
        })
      })

      // 5.20
      test('a blog can be liked', async ({ page }) => {
        const blog = page.locator('.blog').filter({ hasText: 'First blog' })
        await blog.getByRole('button', { name: 'view' }).click()
        await expect(blog.getByText('likes 0')).toBeVisible()

        await blog.getByRole('button', { name: 'like' }).click()

        await expect(blog.getByText('likes 1')).toBeVisible()
      })

      // 5.21
      test('the creator can delete a blog', async ({ page }) => {
        const blog = page.locator('.blog').filter({ hasText: 'First blog' })
        await blog.getByRole('button', { name: 'view' }).click()

        // aceptar el dialogo window.confirm
        page.once('dialog', dialog => dialog.accept())
        await blog.getByRole('button', { name: 'remove' }).click()

        await expect(
          page.locator('.blog').filter({ hasText: 'First blog' })
        ).toHaveCount(0)
      })

      // 5.22
      test('only the creator sees the delete button', async ({ page, request }) => {
        await createUser(request, {
          name: 'Other User',
          username: 'other',
          password: 'secret'
        })

        // con el creador el boton existe
        const own = page.locator('.blog').filter({ hasText: 'First blog' })
        await own.getByRole('button', { name: 'view' }).click()
        await expect(own.getByRole('button', { name: 'remove' })).toBeVisible()

        // con otro usuario no
        await page.getByRole('button', { name: 'logout' }).click()
        await loginWith(page, 'other', 'secret')

        const blog = page.locator('.blog').filter({ hasText: 'First blog' })
        await blog.getByRole('button', { name: 'view' }).click()
        await expect(blog.getByText('https://example.com/1')).toBeVisible()
        await expect(blog.getByRole('button', { name: 'remove' })).toHaveCount(0)
      })
    })

    // 5.23
    test('blogs are ordered by likes, most liked first', async ({ page }) => {
      await createBlog(page, { title: 'Blog A', author: 'A', url: 'https://a.com' })
      await createBlog(page, { title: 'Blog B', author: 'B', url: 'https://b.com' })
      await createBlog(page, { title: 'Blog C', author: 'C', url: 'https://c.com' })

      const likeTimes = async (title, times) => {
        const blog = page.locator('.blog').filter({ hasText: title })
        await blog.getByRole('button', { name: 'view' }).click()
        for (let i = 1; i <= times; i++) {
          await blog.getByRole('button', { name: 'like' }).click()
          await expect(blog.getByText(`likes ${i}`)).toBeVisible()
        }
      }

      await likeTimes('Blog B', 1)
      await likeTimes('Blog C', 3)
      await likeTimes('Blog A', 2)

      const blogs = page.locator('.blog')
      await expect(blogs.nth(0)).toContainText('Blog C')
      await expect(blogs.nth(1)).toContainText('Blog A')
      await expect(blogs.nth(2)).toContainText('Blog B')
    })
  })
})
