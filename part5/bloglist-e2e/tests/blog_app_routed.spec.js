// 5.28: pruebas E2E para la version con React Router y Material UI
// (corre con `bloglist-frontend-routed` en el puerto 5173, no con el frontend basico)
const { test, expect, beforeEach, describe } = require('@playwright/test')
const { resetDb, createUser, loginWith } = require('./helper')

const loginThroughNav = async (page, username, password) => {
  await page.getByRole('link', { name: 'login' }).click()
  await loginWith(page, username, password)
}

const createBlogThroughNav = async (page, { title, author, url }) => {
  await page.getByRole('link', { name: 'new blog' }).click()
  await page.getByTestId('title').fill(title)
  await page.getByTestId('author').fill(author)
  await page.getByTestId('url').fill(url)
  await page.getByRole('button', { name: 'create' }).click()
  await page.getByRole('link', { name: title }).waitFor()
}

describe('Blog app (routed)', () => {
  beforeEach(async ({ page, request }) => {
    await resetDb(request)
    await createUser(request, {
      name: 'Matti Luukkainen',
      username: 'mluukkai',
      password: 'salainen'
    })
    await page.goto('/')
  })

  test('login succeeds with correct credentials', async ({ page }) => {
    await loginThroughNav(page, 'mluukkai', 'salainen')

    await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    await expect(page).toHaveURL('/')
  })

  test('login fails with wrong credentials', async ({ page }) => {
    await loginThroughNav(page, 'mluukkai', 'wrong')

    await expect(page.locator('.notification')).toContainText(
      'wrong username or password'
    )
    await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible()
  })

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await loginThroughNav(page, 'mluukkai', 'salainen')
    })

    test('a user can create a blog', async ({ page }) => {
      await createBlogThroughNav(page, {
        title: 'A routed blog',
        author: 'Playwright',
        url: 'https://playwright.dev'
      })

      await expect(page).toHaveURL('/')
      await expect(page.getByRole('link', { name: 'A routed blog' })).toBeVisible()
    })

    test('a user can like a blog', async ({ page }) => {
      await createBlogThroughNav(page, {
        title: 'A routed blog',
        author: 'Playwright',
        url: 'https://playwright.dev'
      })

      await page.getByRole('link', { name: 'A routed blog' }).click()
      await expect(page.getByText('0 likes')).toBeVisible()

      await page.getByRole('button', { name: 'like' }).click()

      await expect(page.getByText('1 likes')).toBeVisible()
    })

    test('a user can delete a blog', async ({ page }) => {
      await createBlogThroughNav(page, {
        title: 'A routed blog',
        author: 'Playwright',
        url: 'https://playwright.dev'
      })

      await page.getByRole('link', { name: 'A routed blog' }).click()
      page.once('dialog', dialog => dialog.accept())
      await page.getByRole('button', { name: 'remove' }).click()

      await expect(page).toHaveURL('/')
      await expect(page.getByRole('link', { name: 'A routed blog' })).toHaveCount(0)
    })
  })
})
