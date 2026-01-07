
// src/routes/urlRoutes.ts
import { Router } from 'express';
import { UrlController } from '../controllers/urlController';

const router = Router();
const urlController = new UrlController();

// POST /urls/createShortURL
router.post('/urls/createShortURL', (req, res) => urlController.createShortUrl(req, res));

// GET /url/performance/:id
router.get('/url/performance/:id', (req, res) => urlController.getUrlPerformance(req, res));

// GET /:hash (redirect)
router.get('/:hash', (req, res) => urlController.redirectUrl(req, res));

export default router;