// Vercel Serverless Function - Catch-all route for API
// This handles all API routes: /api/*

import app from '../backend/src/app.js';

// Export the handler for Vercel serverless functions
// Vercel will automatically route /api/* requests to this function
export default app;

