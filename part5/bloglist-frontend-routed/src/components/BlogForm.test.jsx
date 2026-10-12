import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

// 5.16
test('calls createBlog with the right details when a blog is created', async () => {
  const user = userEvent.setup()
  const createBlog = vi.fn()

  render(<BlogForm createBlog={createBlog} />)

  await user.type(screen.getByPlaceholderText('write title here'), 'A new blog')
  await user.type(screen.getByPlaceholderText('write author here'), 'Some Author')
  await user.type(screen.getByPlaceholderText('write url here'), 'https://example.com')
  await user.click(screen.getByText('create'))

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0]).toEqual({
    title: 'A new blog',
    author: 'Some Author',
    url: 'https://example.com'
  })
})
