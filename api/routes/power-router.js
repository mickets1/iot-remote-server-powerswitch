import express from 'express'
import createError from 'http-errors'
import { PowerController } from '../controllers/power-controller.js'

export const router = express.Router()
const gptController = new PowerController()

router.get('/', (req, res, next) => gptController.index(req, res, next))
router.get('/allstats', (req, res, next) => gptController.allStats(req, res, next))
router.get('/powerstate', (req, res, next) => gptController.powerState(req, res, next))

router.post('/poweron', (req, res, next) => gptController.powerOn(req, res, next))
router.post('/poweroff', (req, res, next) => gptController.powerOff(req, res, next))
router.post('/restart', (req, res, next) => gptController.hardRestart(req, res, next))
router.post('/createstats', (req, res, next) => gptController.createStats(req, res, next))

router.use('*', (req, res, next) => next(createError(404)))
