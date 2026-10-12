import { render, screen } from '@testing-library/react'
import BlogView from './BlogView'

const blog = {
  id: '1',
  title: 'Component testing is done with react-testing-library',
  author: 'Test Author',
  url: 'https://example.com/testing',
  likes: 7,
  user: { username: 'root', name: 'Root User' }
}

// 5.27
describe('single blog view', () => {
  test('unauthenticated users see the info and likes, but no buttons', () => {
    render(<BlogView blog={blog} user={null} />)

    expect(screen.getByText('Test Author', { exact: false })).toBeVisible()
    expect(screen.getByText('https://example.com/testing')).toBeVisible()
    expect(screen.getByText('7 likes', { exact: false })).toBeVisible()
    expect(screen.queryByRole('button')).toBeNull()
  })

  test('a logged in user who is not the creator only sees the like button', () => {
    render(<BlogView blog={blog} user={{ username: 'other', name: 'Other' }} />)

    expect(screen.getByRole('button', { name: 'like' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'remove' })).toBeNull()
  })

  test('the creator also sees the remove button', () => {
    render(<BlogView blog={blog} user={{ username: 'root', name: 'Root User' }} />)

    expect(screen.getByRole('button', { name: 'like' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'remove' })).toBeVisible()
  })

  test('clicking like calls the handler with the blog', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    const onLike = vi.fn()
    render(
      <BlogView blog={blog} user={{ username: 'other', name: 'Other' }} onLike={onLike} />
    )

    await user.click(screen.getByRole('button', { name: 'like' }))
    await user.click(screen.getByRole('button', { name: 'like' }))

    expect(onLike.mock.calls).toHaveLength(2)
    expect(onLike.mock.calls[0][0]).toBe(blog)
  })
})
