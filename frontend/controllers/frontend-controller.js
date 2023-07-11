import bcrypt from 'bcrypt'
import axios from 'axios'
import { user, sensorData } from '../data.js'

export class FrontendController {
  async index (req, res) {
      res.render('index')
    }


  // Web thing model
  async wtm (req, res) {
      const response = (await axios.get(process.env.API_URL))
      res.json(response.data)
    }

  // authentication
  async login (req, res) {
    try {
      const foundUser = req.body.email === user.email
      if (foundUser) {
        const submittedPass = req.body.password

        // Comparing the hashes.
        const passwordMatch = await bcrypt.compare(submittedPass, user.password)
        
        if (passwordMatch) {
          req.session.auth = true
          this.allStats(req, res)
        } else {
          res.send('<div align="center"><h2>Invalid email or password</h2><br><br><a href="/">login again</a></div>')
        }
      }
      } catch (err) {
      res.send('server/backend error')
    }
  }

  // Retrieve all stats from elasticsearch backend
  async allStats (req, res) {
    if (!req.session.auth) {
      res.status(401).json('Unauthorized')
    }
    
    const response = await axios.get(process.env.API_URL + '/allstats')
    
    if (response.data[0].powerstate === 1) {
      response.data[0].powerstate = 'ON/Booting'
    } else if (response.data[0].powerstate === 0) {
      response.data[0].powerstate = 'OFF/Shutting down'
    } else if (!response.data[0].powerstate) {
      response.data[0].powerstate = 'INIT. To Sync powerstate and Power on Press: Power Off (wait 10 sec) then Power On.'
    }
    const powerstate = response.data.shift()

    res.status(200).render('admin', {data: response.data, ps: powerstate})
  }

  // Send power on to backend
  async powerOn (req, res) {
    if (req.session.auth) {
    await axios.post(process.env.API_URL + '/poweron')
    this.allStats(req, res)
    } else {
      res.status(401).json('Unauthorized')
    }
    
  }

  // Send power off to backend
  async powerOff (req, res) {
    if (req.session.auth) {
    await axios.post(process.env.API_URL + '/poweroff')
    this.allStats(req, res)
    } else {
      res.status(401).json('Unauthorized')
    }
  }

  // log out of the frontend
  async logout (req, res) {
    try {
      res.redirect('.')
    } catch (e) {
      console.error(e)
    }
  }
}