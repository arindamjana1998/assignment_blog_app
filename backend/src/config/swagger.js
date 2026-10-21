import swaggerUi from 'swagger-ui-express';
import env from './env.js';

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'MERN Blog Management System API',
    version: '1.0.0',
    description: `
## Enterprise RESTful API for Blog Management System

Built with **Node.js (ES Modules)**, **Express.js**, and **MongoDB with Mongoose**.

### Key Architectural & Security Highlights:
- **Dual JWT Authentication**: Short-lived Access Tokens (15m) & Long-lived Refresh Tokens (7d).
- **Refresh-Token Rotation & Reuse Detection**: Replay of compromised or rotated tokens immediately invalidates all active sessions for the user.
- **Strict Role-Based Access Control (RBAC)**: Distinguishes \`user\` and \`admin\` permissions. Public registration strictly blocks admin privilege escalation.
- **Post & Comment Lifecycle**: Automatic URL-friendly collision-safe slug generation, full-text search, soft deletion, and foreign-key integrity.
- **Enterprise Middleware**: Helmet, CORS with explicit frontend origin, rate limiting on sensitive auth routes, and centralized error normalization.
    `,
    contact: {
      name: 'API Support Team',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}`,
      description: 'Local Development Server',
    },
  ],
  tags: [
    { name: 'System', description: 'System health & diagnostic endpoints' },
    { name: 'Auth', description: 'Registration, login, refresh token rotation, logout, and OAuth 2.0' },
    { name: 'Users', description: 'Current authenticated user profile management' },
    { name: 'Posts', description: 'Blog post creation, slug retrieval, search, pagination, and soft deletion' },
    { name: 'Comments', description: 'Threaded comment management with post integrity verification' },
    { name: 'Admin', description: 'Administrative platform oversight, user moderation, post/comment moderation, and metrics' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'System Health & Diagnostic Check',
        description: 'Returns operational status, process uptime, and live MongoDB connection state.',
        responses: {
          200: {
            description: 'System operational and database connected',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    status: { type: 'string', example: 'UP' },
                    timestamp: { type: 'string', format: 'date-time' },
                    uptimeSeconds: { type: 'number', example: 124 },
                    environment: { type: 'string', example: 'development' },
                    database: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'connected' },
                        host: { type: 'string', example: 'cluster0.mongodb.net' },
                        databaseName: { type: 'string', example: 'blog_app' },
                      },
                    },
                  },
                },
              },
            },
          },
          503: { description: 'Database disconnected or server unhealthy' },
        },
      },
    },

    // ==========================================
    // AUTHENTICATION
    // ==========================================
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Creates a standard user account with password hashing via bcrypt (12 rounds). Any attempt to pass role fields is rejected.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'number', example: 201 },
                    message: { type: 'string', example: 'User registered successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Validation failed or privilege escalation rejected', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          409: { description: 'Email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          429: { description: 'Rate limit exceeded' },
        },
      },
    },

    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate with email & password',
        description: 'Authenticates credentials, returns an access token and refresh token, and sets a secure HttpOnly refresh cookie.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            headers: {
              'Set-Cookie': {
                schema: { type: 'string', example: 'refreshToken=eyJ...; Path=/api/v1/auth; HttpOnly; SameSite=Strict' },
                description: 'HttpOnly cookie containing the signed refresh token',
              },
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Login successful' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Invalid email or password', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Account deactivated' },
        },
      },
    },

    '/api/v1/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Rotate refresh token and issue new token pair',
        description: 'Accepts refresh token via HttpOnly cookie or request body. Employs token rotation: old token is invalidated and replaced. If a reused token is detected, all user sessions are terminated.',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Token rotated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Token refreshed successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Invalid, expired, or reused refresh token' },
        },
      },
    },

    '/api/v1/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout and revoke refresh token',
        description: 'Revokes the stored refresh token hash in the database and clears the HttpOnly cookie.',
        responses: {
          200: {
            description: 'Logout successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Logout successful' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'User profile retrieved successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Missing or invalid Bearer access token' },
        },
      },
    },

    '/api/v1/auth/google': {
      get: {
        tags: ['Auth'],
        summary: 'Initiate Google OAuth 2.0 flow',
        description: 'Redirects client to Google OAuth consent screen requesting profile and email scopes.',
        responses: {
          302: { description: 'Redirect to Google authentication consent' },
        },
      },
    },

    '/api/v1/auth/google/callback': {
      get: {
        tags: ['Auth'],
        summary: 'Google OAuth 2.0 Callback',
        description: 'Google redirects here after authorization. Creates/links user, generates JWT tokens, and redirects to frontend with auth payload.',
        responses: {
          302: { description: 'Redirect to frontend application callback' },
        },
      },
    },

    '/api/v1/auth/facebook': {
      get: {
        tags: ['Auth'],
        summary: 'Initiate Facebook OAuth 2.0 flow',
        description: 'Redirects client to Facebook Login dialog requesting email scope.',
        responses: {
          302: { description: 'Redirect to Facebook authentication dialog' },
        },
      },
    },

    '/api/v1/auth/facebook/callback': {
      get: {
        tags: ['Auth'],
        summary: 'Facebook OAuth 2.0 Callback',
        description: 'Facebook redirects here after authorization. Creates/links user, generates JWT tokens, and redirects to frontend.',
        responses: {
          302: { description: 'Redirect to frontend application callback' },
        },
      },
    },

    // ==========================================
    // USERS
    // ==========================================
    '/api/v1/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get profile of current user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: { user: { $ref: '#/components/schemas/User' } },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update current user profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProfileInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Profile updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User profile updated successfully' },
                    data: {
                      type: 'object',
                      properties: { user: { $ref: '#/components/schemas/User' } },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error or incorrect current password' },
          401: { description: 'Unauthorized' },
        },
      },
    },

    // ==========================================
    // POSTS
    // ==========================================
    '/api/v1/posts': {
      get: {
        tags: ['Posts'],
        summary: 'Get public published posts',
        description: 'Retrieves non-deleted posts with pagination, title/content search, and author filtering.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search term matched across title & content' },
          { name: 'author', in: 'query', schema: { type: 'string' }, description: 'Filter by author User ObjectId' },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'title'], default: 'createdAt' } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          200: {
            description: 'Posts retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Posts retrieved successfully' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Post' },
                    },
                    pagination: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Posts'],
        summary: 'Create a new blog post',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePostInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Post created successfully with unique slug generated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'number', example: 201 },
                    message: { type: 'string', example: 'Post created successfully' },
                    data: {
                      type: 'object',
                      properties: { post: { $ref: '#/components/schemas/Post' } },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' },
        },
      },
    },

    '/api/v1/posts/{id}': {
      get: {
        tags: ['Posts'],
        summary: 'Get published post by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Post retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: { post: { $ref: '#/components/schemas/Post' } },
                    },
                  },
                },
              },
            },
          },
          404: { description: 'Post not found or soft-deleted' },
        },
      },
      patch: {
        tags: ['Posts'],
        summary: 'Update post title or content',
        description: 'Allowed for the post author or an administrator. Modifying the title automatically updates the unique slug.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdatePostInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Post updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Post updated successfully' },
                    data: {
                      type: 'object',
                      properties: { post: { $ref: '#/components/schemas/Post' } },
                    },
                  },
                },
              },
            },
          },
          403: { description: 'Forbidden: not the author or administrator' },
          404: { description: 'Post not found' },
        },
      },
      delete: {
        tags: ['Posts'],
        summary: 'Soft-delete post',
        description: 'Marks post as isDeleted: true. Permitted for post author or admin.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Post deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Post deleted successfully' },
                  },
                },
              },
            },
          },
          403: { description: 'Forbidden' },
          404: { description: 'Post not found' },
        },
      },
    },

    '/api/v1/posts/slug/{slug}': {
      get: {
        tags: ['Posts'],
        summary: 'Get published post by unique slug',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Post retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: { post: { $ref: '#/components/schemas/Post' } },
                    },
                  },
                },
              },
            },
          },
          404: { description: 'Post not found or deleted' },
        },
      },
    },

    // ==========================================
    // COMMENTS
    // ==========================================
    '/api/v1/posts/{postId}/comments': {
      get: {
        tags: ['Comments'],
        summary: 'Get paginated comments for a post',
        parameters: [
          { name: 'postId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: {
            description: 'Comments retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Comment' },
                    },
                    pagination: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          404: { description: 'Post not found or deleted' },
        },
      },
      post: {
        tags: ['Comments'],
        summary: 'Create a comment on a post',
        description: 'Authenticated users can post comments. Target post must be active and not deleted.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'postId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateCommentInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Comment created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'number', example: 201 },
                    message: { type: 'string', example: 'Comment created successfully' },
                    data: {
                      type: 'object',
                      properties: { comment: { $ref: '#/components/schemas/Comment' } },
                    },
                  },
                },
              },
            },
          },
          404: { description: 'Target post does not exist or has been deleted' },
        },
      },
    },

    '/api/v1/comments/{id}': {
      patch: {
        tags: ['Comments'],
        summary: 'Update comment content',
        description: 'Allowed for comment author or administrator.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateCommentInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Comment updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Comment updated successfully' },
                    data: {
                      type: 'object',
                      properties: { comment: { $ref: '#/components/schemas/Comment' } },
                    },
                  },
                },
              },
            },
          },
          403: { description: 'Forbidden' },
          404: { description: 'Comment not found' },
        },
      },
      delete: {
        tags: ['Comments'],
        summary: 'Delete comment',
        description: 'Marks comment as deleted. Permitted for comment author or administrator.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Comment deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Comment deleted successfully' },
                  },
                },
              },
            },
          },
          403: { description: 'Forbidden' },
          404: { description: 'Comment not found' },
        },
      },
    },

    // ==========================================
    // ADMIN OPERATIONS
    // ==========================================
    '/api/v1/admin/dashboard': {
      get: {
        tags: ['Admin'],
        summary: 'Get platform metrics & aggregate counts',
        description: 'Returns real-time counts for total users, active users, non-deleted posts, and non-deleted comments.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Dashboard metrics retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Dashboard metrics retrieved successfully' },
                    data: { $ref: '#/components/schemas/DashboardMetrics' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden: Admin role required' },
        },
      },
    },

    '/api/v1/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'List all users with filters',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['user', 'admin'] } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: {
            description: 'Users retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                    pagination: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/v1/admin/users/{id}': {
      get: {
        tags: ['Admin'],
        summary: 'Get user details with statistics',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'User details retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        statistics: {
                          type: 'object',
                          properties: {
                            postsCount: { type: 'number', example: 5 },
                            commentsCount: { type: 'number', example: 12 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          404: { description: 'User not found' },
        },
      },
      patch: {
        tags: ['Admin'],
        summary: 'Update user role or active status',
        description: 'Admins cannot deactivate or demote their own account.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AdminUpdateUserInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'User updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User updated successfully' },
                    data: {
                      type: 'object',
                      properties: { user: { $ref: '#/components/schemas/User' } },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid self-modification attempt' },
          404: { description: 'User not found' },
        },
      },
      delete: {
        tags: ['Admin'],
        summary: 'Delete user and purge active sessions',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'User deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User deleted or deactivated successfully' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/v1/admin/posts': {
      get: {
        tags: ['Admin'],
        summary: 'List all posts (including soft-deleted posts)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'author', in: 'query', schema: { type: 'string' } },
          { name: 'isDeleted', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: {
            description: 'Admin posts retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Post' } },
                    pagination: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/v1/admin/posts/{id}': {
      patch: {
        tags: ['Admin'],
        summary: 'Update or restore post',
        description: 'Admins can update fields or restore a soft-deleted post by setting isDeleted: false.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AdminUpdatePostInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Post updated/restored successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: { post: { $ref: '#/components/schemas/Post' } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Admin'],
        summary: 'Permanently remove post and cascade comments',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Post permanently deleted',
          },
        },
      },
    },

    '/api/v1/admin/comments': {
      get: {
        tags: ['Admin'],
        summary: 'List all comments across the platform',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'post', in: 'query', schema: { type: 'string' } },
          { name: 'author', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Comments retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Comment' } },
                    pagination: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/v1/admin/comments/{id}': {
      delete: {
        tags: ['Admin'],
        summary: 'Permanently remove any comment',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Comment permanently removed',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your JWT access token as: Bearer <access_token>',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
        description: 'HttpOnly cookie containing the refresh token',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6ad21fcb29bbb7747b1d9218' },
          name: { type: 'string', example: 'Alice Developer' },
          email: { type: 'string', example: 'alice@example.com' },
          role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          avatar: { type: 'string', nullable: true, example: 'https://example.com/avatar.jpg' },
          isActive: { type: 'boolean', example: true },
          oauthProvider: {
            type: 'object',
            properties: {
              provider: { type: 'string', enum: ['local', 'google', 'facebook'], example: 'local' },
              providerId: { type: 'string', nullable: true },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      Post: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6ad221157116f28d01ea55f6' },
          title: { type: 'string', example: 'Building Scalable REST APIs with Node.js and MongoDB' },
          slug: { type: 'string', example: 'building-scalable-rest-apis-with-nodejs-and-mongodb' },
          content: { type: 'string', example: 'Comprehensive guide covering architectural design...' },
          author: {
            oneOf: [
              { type: 'string', example: '6ad21fcb29bbb7747b1d9218' },
              { $ref: '#/components/schemas/User' },
            ],
          },
          isDeleted: { type: 'boolean', example: false },
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      Comment: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6ad221177116f28d01ea5600' },
          content: { type: 'string', example: 'Great article on Express backend architecture!' },
          author: {
            oneOf: [
              { type: 'string' },
              { $ref: '#/components/schemas/User' },
            ],
          },
          post: { type: 'string', example: '6ad221157116f28d01ea55f6' },
          isDeleted: { type: 'boolean', example: false },
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      DashboardMetrics: {
        type: 'object',
        properties: {
          totalUsers: { type: 'integer', example: 45 },
          activeUsers: { type: 'integer', example: 42 },
          totalPosts: { type: 'integer', example: 128 },
          totalComments: { type: 'integer', example: 512 },
        },
      },

      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          totalItems: { type: 'integer', example: 42 },
          totalPages: { type: 'integer', example: 5 },
          hasNextPage: { type: 'boolean', example: true },
          hasPrevPage: { type: 'boolean', example: false },
        },
      },

      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Resource conflict or validation error' },
          statusCode: { type: 'integer', example: 400 },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Invalid email address format' },
              },
            },
          },
        },
      },

      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Alice Developer', minLength: 2, maxLength: 60 },
          email: { type: 'string', format: 'email', example: 'alice@example.com' },
          password: { type: 'string', format: 'password', minLength: 6, maxLength: 100, example: 'Password123!' },
        },
      },

      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'alice@example.com' },
          password: { type: 'string', format: 'password', example: 'Password123!' },
        },
      },

      RefreshInput: {
        type: 'object',
        properties: {
          refreshToken: { type: 'string', description: 'Optional if sending HttpOnly cookie' },
        },
      },

      UpdateProfileInput: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Alice Updated', minLength: 2, maxLength: 60 },
          avatar: { type: 'string', format: 'uri', example: 'https://example.com/avatar.jpg' },
          currentPassword: { type: 'string', format: 'password', example: 'Password123!' },
          newPassword: { type: 'string', format: 'password', minLength: 6, example: 'NewSecret123!' },
        },
      },

      CreatePostInput: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
          title: { type: 'string', example: 'Building Scalable REST APIs with Node.js and MongoDB', minLength: 3, maxLength: 180 },
          content: { type: 'string', example: 'Comprehensive guide covering architectural design...', minLength: 5 },
        },
      },

      UpdatePostInput: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 3, maxLength: 180 },
          content: { type: 'string', minLength: 5 },
        },
      },

      CreateCommentInput: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 1500, example: 'Great article on Express backend architecture!' },
        },
      },

      UpdateCommentInput: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 1500, example: 'Updated comment content' },
        },
      },

      AdminUpdateUserInput: {
        type: 'object',
        properties: {
          role: { type: 'string', enum: ['user', 'admin'] },
          isActive: { type: 'boolean' },
        },
      },

      AdminUpdatePostInput: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          isDeleted: { type: 'boolean' },
        },
      },
    },
  },
};

export const setupSwagger = (app) => {
  // Raw OpenAPI JSON spec endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Swagger UI Interactive Explorer
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'MERN Blog API Documentation',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  );

  console.log('[Swagger] Interactive API Documentation available at /api-docs');
};

export default setupSwagger;
