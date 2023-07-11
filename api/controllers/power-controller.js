/* eslint-disable jsdoc/require-jsdoc */
import bcrypt from 'bcrypt'

export class PowerController {
  /**
   * Relay web things model info to frontend.
   *
   * @param {object} req express request object
   * @param {object} res express response object
   * @returns {object} json
   * @memberof PowerController
   */
  async index (req, res) {
    return res.json(
      {
        id: 'pc-power-switch-001',
        title: 'PC power switch and stats reader',
        description: 'A pc power switch and stats reader web thing model',
        properties: {
          temperature: {
            title: 'temp',
            type: 'string',
            description: 'The current temperature in Celsius',
            unit: 'degree Celsius',
            readOnly: true,
            authRequired: true
          },
          humidity: {
            title: 'humidity',
            type: 'string',
            description: 'The current humidity in percentage',
            unit: '%',
            readOnly: true,
            authRequired: true
          },
          pressure: {
            title: 'serverinfo',
            type: 'string',
            description: 'PC stats like cpu usage, free memory etc.',
            readOnly: true,
            authRequired: true
          },
          actions: {
            poweron: {
              title: 'poweron',
              description: 'powers on the computer',
              authRequired: true
            },
            poweroff: {
              title: 'poweroff',
              description: 'powers off the computer',
              authRequired: true
            }
          }
        }
      }
    )
  }

  // authentication from Iot device.
  async auth (password) {
    try {
      const passwordMatch = await bcrypt.compare(password, process.env.PWDHASH)

      if (passwordMatch) {
        return true
      }
      return false
    } catch (error) {
      console.error(error)
    }
  }

  async powerState (req, res, next) {
    res.json(req.app.locals.powerstate)
  }

  // change the dynamic powerstate. 1 == poweron
  async powerOn (req, res, next) {
    try {
      req.app.locals.powerstate = 1
      res.status(200)
    } catch (err) {
      console.error()
    }
  }

  // change the dynamic powerstate. 0 == poweroff
  async powerOff (req, res, next) {
    try {
      req.app.locals.powerstate = 0
      res.status(200)
    } catch (err) {
      console.error()
    }
  }

  // Not implemented for now.
  async hardRestart (req, res, next) {
    try {
      // wait for pc iot response when up.
      console.log(req.app.locals.powerstate)
      req.app.locals.powerstate = 3
      console.log('power restart backend')
      res.status(200).send('Restarting...')
    } catch (err) {
      console.error()
    }
  }

  // create stats from IoT device in Elasticsearch
  async createStats (req, res, next) {
    try {
      // auth from IoT device
      if (await this.auth(req.body.password)) {
        await req.app.es.index({
          index: 'docker',
          document: {
            ts: req.body.ts,
            serverinfo: req.body.data.toString(),
            temp: req.body.dht.tempC.toString(),
            humidity: req.body.dht.humidity.toString()
          }
        })

        res.status(200)
      } else {
        res.status(401).json('Unauthorized')
      }
    } catch (err) {
      res.status(500).json('server error')
    }
  }

  // Get all stats from Elasticsearch
  // Future: We should add a routinary delete funtion to delete records over a certain limit/number.
  async allStats (req, res, next) {
    try {
      // Sorted by timestamp, newest entry first.
      const result = await req.app.es.search({
        query: {
          match_all: {}
        },
        sort: [
          {
            ts: {
              order: 'desc'
            }
          }
        ]
      })

      // Remove metadata from result.
      const truncRes = []
      for (const i of result.hits.hits) {
        truncRes.push(i._source)
      }

      // powerstate always first.
      truncRes.unshift({ powerstate: req.app.locals.powerstate })

      return res.json(truncRes)
    } catch (e) {
      console.error(e)
    }
  }
}
