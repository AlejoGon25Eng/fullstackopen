import { Card, CardContent, Typography, Button } from '@mui/material'

// 5.25 y 5.31: vista de un solo blog
const BlogView = ({ blog, user, onLike, onDelete }) => {
  const isCreator = user && blog.user && blog.user.username === user.username

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2">
          {blog.title} {blog.author}
        </Typography>
        <Typography>
          <a href={blog.url}>{blog.url}</a>
        </Typography>
        <Typography>
          {blog.likes} likes
          {user && (
            <Button size="small" sx={{ ml: 1 }} onClick={() => onLike(blog)}>
              like
            </Button>
          )}
        </Typography>
        <Typography>added by {blog.user && blog.user.name}</Typography>
        {isCreator && (
          <Button
            color="error"
            variant="outlined"
            sx={{ mt: 1 }}
            onClick={() => onDelete(blog)}
          >
            remove
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default BlogView
