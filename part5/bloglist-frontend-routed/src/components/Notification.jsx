import { Alert } from '@mui/material'

// 5.30: notificaciones con Material UI
const Notification = ({ notification }) => {
  if (notification === null) {
    return null
  }

  return (
    <Alert
      className="notification"
      severity={notification.type === 'error' ? 'error' : 'success'}
      sx={{ mb: 2 }}
    >
      {notification.message}
    </Alert>
  )
}

export default Notification
