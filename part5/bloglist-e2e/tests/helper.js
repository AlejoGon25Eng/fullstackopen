const BACKEND = 'http://localhost:3003'

const resetDb = async request => {
  await request.post(`${BACKEND}/api/testing/reset`)
}

const createUser = async (request, user) => {
  await request.post(`${BACKEND}/api/users`, { data: user })
}

const loginWith = async (page, username, password) => {
  await page.getByTestId('username').fill(username)
  await page.getByTestId('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, { title, author, url }) => {
  await page.getByRole('button', { name: 'create new blog' }).click()
  await page.getByTestId('title').fill(title)
  await page.getByTestId('author').fill(author)
  await page.getByTestId('url').fill(url)
  await page.getByRole('button', { name: 'create' }).click()
  // esperar a que el blog aparezca en la lista
  await page.locator('.blog').filter({ hasText: title }).waitFor()
}

module.exports = { BACKEND, resetDb, createUser, loginWith, createBlog }
