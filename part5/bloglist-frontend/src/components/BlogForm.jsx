import { useState } from 'react'

const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const addBlog = event => {
    event.preventDefault()
    createBlog({ title, author, url })
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={addBlog}>
        <div>
          title
          <input
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder="write title here"
            data-testid="title"
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={event => setAuthor(event.target.value)}
            placeholder="write author here"
            data-testid="author"
          />
        </div>
        <div>
          url
          <input
            value={url}
            onChange={event => setUrl(event.target.value)}
            placeholder="write url here"
            data-testid="url"
          />
        </div>
        <button type="submit">create</button>
      </form>
    </div>
  )
}

export default BlogForm
