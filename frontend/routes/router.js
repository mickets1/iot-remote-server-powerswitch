import express from 'express'
import createError from 'http-errors'
import { router as frontendRouter } from './frontend-router.js'

export const router = express.Router()
router.use('/', frontendRouter)

// Catch 404 (ALWAYS keep this as the last route).
router.use('*', (req, res, next) => next(createError(404)))
