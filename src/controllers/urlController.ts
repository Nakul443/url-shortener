import { Request, Response } from 'express';
import getConnection from '../db';
import { hashUrl, isValidUrl } from '../services/urlService';

export class UrlController {
  // POST /urls/createShortURL
  async createShortUrl(req: Request, res: Response): Promise<void> {
    const { url, userId } = req.body ?? {};

    if (typeof url !== 'string' || !isValidUrl(url)) {
      res.status(400).json({ error: 'INVALID URL' });
      return;
    }

    const shortUrl = hashUrl(url);

    try {
      const connection = await getConnection();
      await connection.query(
        'INSERT INTO urls (url, shortened_url, user_id) VALUES(?,?,?)',
        [url, shortUrl, userId ?? null]
      );

      res.status(201).json({
        url,
        shortened_url: shortUrl,
        userId: userId ?? null
      });
    } catch (error) {
      console.error('Failed to create short URL:', error);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  }

  // GET /url/performance/:id
  async getUrlPerformance(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'INVALID_ID' });
      return;
    }

    try {
      const connection = await getConnection();
      const sql = `
        SELECT u.id,
               u.url,
               u.shortened_url,
               COUNT(c.id) AS views
        FROM urls u
        LEFT JOIN clicks c ON c.id = u.id
        WHERE u.id = ?
        GROUP BY u.id, u.url, u.shortened_url
      `;
      const [results] = await connection.execute<any[]>(sql, [id]);

      if (!results.length) {
        res.status(404).send('URL NOT FOUND');
        return;
      }

      res.json(results[0]);
    } catch (error) {
      console.error('Failed to fetch URL performance:', error);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  }

  // GET /:hash
  async redirectUrl(req: Request, res: Response): Promise<void> {
    const { hash } = req.params;

    try {
      const connection = await getConnection();
      const [results] = await connection.execute<any[]>(
        'SELECT id, url FROM urls WHERE shortened_url = ?',
        [hash]
      );

      if (!results.length) {
        res.status(404).send('URL NOT FOUND');
        return;
      }

      await connection.execute('INSERT INTO clicks (id, timestamp) VALUES (?, NOW())', [
        results[0].id
      ]);

      res.redirect(results[0].url);
    } catch (error) {
      console.error('Failed to redirect URL:', error);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  }
}