import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LMS API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Learning Management System',
    },
    security: [],
    servers: [
      {
        url: 'http://localhost:3025',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Role: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { $ref: '#/components/schemas/Role' },
            code: { type: 'string' },
            status: { type: 'string' },
            isVerified: { type: 'boolean' },
            lastLogin: { type: 'string', format: 'date-time' },
            deletedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        TokenData: {
          type: 'object',
          properties: {
            token: { type: 'string', description: 'JWT token' },
          },
          example: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          }
        },
        Error: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              description: 'The field that caused the error',
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Current page number',
            },
            limit: {
              type: 'integer',
              description: 'Number of items per page',
            },
            total: {
              type: 'integer',
              description: 'Total number of items',
            },
            totalPages: {
              type: 'integer',
              description: 'Total number of pages',
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            statusCode: {
              type: 'integer',
              description: 'HTTP status code',
            },
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful',
            },
            message: {
              type: 'string',
              description: 'Response message',
            },
            data: {
              description: 'Response data (varies by endpoint)',
              anyOf: [
                { $ref: '#/components/schemas/TokenData' },
                { $ref: '#/components/schemas/User' },
                { type: 'object' },
                { type: 'array' }
              ]
            },
            meta: {
              $ref: '#/components/schemas/PaginationMeta',
            },
            errors: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Error',
              },
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Response timestamp',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer' },
            success: { type: 'boolean' },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: { $ref: '#/components/schemas/Error' }
            },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        ApiResponseExample: {
          type: 'object',
          example: {
            statusCode: 200,
            success: true,
            message: 'OK',
            data: { id: 'uuid-or-object' },
            timestamp: new Date().toISOString(),
          }
        }
      },
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
