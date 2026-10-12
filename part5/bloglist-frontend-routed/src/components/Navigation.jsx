import { Link } from 'react-router-dom'
import { AppBar, Toolbar, Button, Typography } from '@mui/material'

// 5.24 y 5.30: barra de navegacion
const Navigation = ({ user, onLogout }) => (
  <AppBar position="static" sx={{ mb: 3 }}>
    <Toolbar>
      <Button color="inherit" component={Link} to="/">
        blogs
      </Button>
      {user && (
        <Button color="inherit" component={Link} to="/create">
          new blog
        </Button>
      )}
      <span style={{ flexGrow: 1 }} />
      {user ? (
        <>
          <Typography sx={{ mr: 2 }}>{user.name} logged in</Typography>
          <Button color="inherit" onClick={onLogout}>
            logout
          </Button>
        </>
      ) : (
        <Button color="inherit" component={Link} to="/login">
          login
        </Button>
      )}
    </Toolbar>
  </AppBar>
)

export default Navigation
