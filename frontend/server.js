import express from 'express'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import session from 'express-session'
import { router } from './routes/frontend-router.js'

await init()
async function init () {
  try {
    const app = express()
    app.use(cors())

    const directoryFullName = dirname(fileURLToPath(import.meta.url))

    app.set(join(directoryFullName, 'views'))
    app.set('view engine', 'squirrelly')

    // Parse requests.
    app.use(express.urlencoded({ extended: false }))
    app.use(express.json())

    app.use(express.static(join(directoryFullName, 'public')))

    const sessionOptions = {
      name: process.env.SESSION_NAME,
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        sameSite: 'none'
      }
    }

    if (app.get('env') === 'production') {
      app.set('trust proxy', 1) // trust first proxy
      sessionOptions.cookie.secure = true // serve secure cookies
    }

    app.use(session(sessionOptions))


    app.use('/', router)

    app.listen(process.env.PORT, () => {
      console.log('Server running at http://localhost:' + process.env.PORT)
      console.log('Press Ctrl-C to terminate...')
    })
  } catch (e) {
    console.error(e)
  }
}