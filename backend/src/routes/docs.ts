/**
 * API Documentation Route
 * 
 * Serves OpenAPI/Swagger documentation
 */

import { Hono } from 'hono';
import type { Env } from '../types/env.js';

const app = new Hono<Env>();

// Basic OpenAPI spec (can be enhanced with @asteasolutions/zod-to-openapi)
const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'BILAN-EASY API',
    version: '1.0.0',
    description: 'API documentation for BILAN-EASY Skills Assessment Platform',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:3001',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'User login',
        description: 'Authenticate user and return JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        name: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'User registration',
        description: 'Register a new user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created successfully',
          },
          '400': {
            description: 'Validation error',
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current user',
        description: 'Get authenticated user information',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'User information',
          },
          '401': {
            description: 'Unauthorized',
          },
        },
      },
    },
    '/api/assessments': {
      get: {
        summary: 'List assessments',
        description: 'Get list of assessments for current user',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of assessments',
          },
        },
      },
      post: {
        summary: 'Create assessment',
        description: 'Create a new assessment',
        security: [{ BearerAuth: [] }],
        responses: {
          '201': {
            description: 'Assessment created',
          },
        },
      },
    },
    '/api/users': {
      get: {
        summary: 'List users',
        description: 'Get list of users (admin only)',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of users',
          },
          '403': {
            description: 'Forbidden - Admin access required',
          },
        },
      },
    },
    '/api/roles': {
      get: {
        summary: 'List roles',
        description: 'Get list of roles',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of roles',
          },
        },
      },
    },
    '/api/audit': {
      get: {
        summary: 'List audit logs',
        description: 'Get audit trail logs',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of audit logs',
          },
        },
      },
    },
  },
};

// GET /api/docs - OpenAPI JSON spec
app.get('/api/docs', (c) => {
  return c.json(openApiSpec);
});

// GET /api/docs/swagger - Swagger UI HTML
app.get('/api/docs/swagger', (c) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BILAN-EASY API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: '/api/docs',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>
  `;
  return c.html(html);
});

export default app;

