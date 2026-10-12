// @ts-check
const { defineConfig, devices } = require('@playwright/test')

// El backend (en modo test, puerto 3003) y el frontend (puerto 5173)
// deben estar corriendo antes de lanzar las pruebas. Ver README.
module.exports = defineConfig({
  testDir: './tests',
  // las pruebas comparten la base de datos, asi que van una a una
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // opcional: ruta a un Chromium ya instalado, si no quieres descargar el de Playwright
        launchOptions: process.env.E2E_CHROME
          ? { executablePath: process.env.E2E_CHROME }
          : {}
      }
    }
  ]
})
