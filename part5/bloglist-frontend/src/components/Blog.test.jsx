import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

const blog = {
  title: 'Component testing is done with react-testing-library',
  author: 'Test Author',
  url: 'https://example.com/testing',
  likes: 7,
  user: { username: 'root', name: 'Root User' }
}

// 5.13
test('renders title and author but not url or likes by default', () => {
  const { container } = render(<Blog blog={blog} />)

  expect(
    screen.getByText('Component testing is done with react-testing-library', {
      exact: false
    })
  ).toBeVisible()
  expect(screen.getByText('Test Author', { exact: false })).toBeVisible()

  expect(container.querySelector('.blog-details')).toBeNull()
  expect(screen.queryByText('https://example.com/testing')).toBeNull()
  expect(screen.queryByText('likes 7', { exact: false })).toBeNull()
})

// 5.14
test('shows url and likes after clicking the view button', async () => {
  const user = userEvent.setup()
  render(<Blog blog={blog} />)

  await user.click(screen.getByText('view'))

  expect(screen.getByText('https://example.com/testing')).toBeVisible()
  expect(screen.getByText('likes 7', { exact: false })).toBeVisible()
})

// 5.15
test('calls the like handler twice when like is clicked twice', async () => {
  const user = userEvent.setup()
  const mockHandler = vi.fn()
  render(<Blog blog={blog} onLike={mockHandler} />)

  await user.click(screen.getByText('view'))
  const likeButton = screen.getByText('like')
  await user.click(likeButton)
  await user.click(likeButton)

  expect(mockHandler.mock.calls).toHaveLength(2)
})
