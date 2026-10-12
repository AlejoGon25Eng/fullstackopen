import { useState } from 'react'
import { TextField, Button, Stack, Typography } from '@mui/material'

// 5.26 y 5.29: formulario para crear blogs (vista /create)
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
    <form onSubmit={addBlog}>
      <Stack spacing={2} sx={{ maxWidth: 480 }}>
        <Typography variant="h5" component="h2">
          create new
        </Typography>
        <TextField
          label="title"
          value={title}
          onChange={event => setTitle(event.target.value)}
          placeholder="write title here"
          slotProps={{ htmlInput: { 'data-testid': 'title' } }}
        />
        <TextField
          label="author"
          value={author}
          onChange={event => setAuthor(event.target.value)}
          placeholder="write author here"
          slotProps={{ htmlInput: { 'data-testid': 'author' } }}
        />
        <TextField
          label="url"
          value={url}
          onChange={event => setUrl(event.target.value)}
          placeholder="write url here"
          slotProps={{ htmlInput: { 'data-testid': 'url' } }}
        />
        <Button variant="contained" type="submit">
          create
        </Button>
      </Stack>
    </form>
  )
}

export default BlogForm
