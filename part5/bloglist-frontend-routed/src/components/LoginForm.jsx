import { useState } from 'react'
import { TextField, Button, Stack, Typography } from '@mui/material'

// 5.29: formulario con Material UI
const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = event => {
    event.preventDefault()
    onLogin({ username, password })
    setUsername('')
    setPassword('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2} sx={{ maxWidth: 360 }}>
        <Typography variant="h5" component="h2">
          Log in to application
        </Typography>
        <TextField
          label="username"
          value={username}
          onChange={({ target }) => setUsername(target.value)}
          slotProps={{ htmlInput: { 'data-testid': 'username' } }}
        />
        <TextField
          label="password"
          type="password"
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          slotProps={{ htmlInput: { 'data-testid': 'password' } }}
        />
        <Button variant="contained" type="submit">
          login
        </Button>
      </Stack>
    </form>
  )
}

export default LoginForm
