/* eslint-disable jsdoc/require-jsdoc */
import express from 'express'
import cors from 'cors'
import { router } from './routes/power-router.js'
import { elasticInit } from './elastic/elastic.js'

await test()
async function test () {
  try {
    const app = express()
    app.use(cors())
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))

    app.use('/', router)
    app.locals.powerstate = null

    app.es = await elasticInit()
    if (!app.es) {
      throw new Error('Elasticsearch not initialized')
    }

    // Error handler.
    app.use(function (err, req, res, next) {
      // 404 Not Found.
      if (err.status === 404) {
        return res
          .status(404)
      }

      // 500 Internal Server Error (in production, all other errors send this response).
      return res
        .status(500)
    })

    app.listen(process.env.PORT, () => {
      console.log('Server running at http://localhost:' + process.env.PORT)
      console.log('Press Ctrl-C to terminate...')
    })
  } catch (error) {
    console.error(error)
  }
}
