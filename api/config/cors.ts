import env from '#start/env'
import { defineConfig } from '@adonisjs/cors'

const allowedOrigins = ['http://localhost:5173']

const frontendUrl = env.get('FRONTEND_URL')
if (frontendUrl) {
  allowedOrigins.push(frontendUrl)
}

export default defineConfig({
  enabled: true,
  origin: allowedOrigins,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})
