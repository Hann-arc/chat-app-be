import app from '../src/server.js';

export default async function handler(req, res) {
  app(req, res);
}