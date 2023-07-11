import express from 'express'
import createError from 'http-errors'
import { FrontendController } from '../controllers/frontend-controller.js'

export const router = express.Router()
const frontendController = new FrontendController()

router.get('/', (req, res, next) => frontendController.index(req, res, next))
router.get('/wtm', (req, res, next) => frontendController.wtm(req, res, next))
router.post('/login', (req, res, next) => frontendController.login(req, res, next))
router.post('/logout', (req, res, next) => frontendController.logout(req, res, next))
router.post('/poweron', (req, res, next) => frontendController.powerOn(req, res, next))
router.post('/poweroff', (req, res, next) => frontendController.powerOff(req, res, next))
router.get('/allstats', (req, res, next) => frontendController.allStats(req, res, next))

router.use('*', (req, res, next) => next(createError(404)))
