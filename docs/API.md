# API Documentation

## Base URL

```
Development: http://localhost:3001/api
Production: [Your production URL]/api
```

## Authentication

All API requests (except `/auth/register` and `/auth/login`) require authentication via JWT token.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt_token"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "roles": [...],
      "permissions": [...]
    },
    "token": "jwt_token"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Get User Permissions
```http
GET /api/auth/permissions
Authorization: Bearer <token>
```

### Users

#### List Users
```http
GET /api/users?limit=10&offset=0&search=john
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (number): Number of results per page
- `offset` (number): Pagination offset
- `search` (string): Search term (name or email)

**Response:**
```json
{
  "data": {
    "users": [...],
    "pagination": {
      "total": 100,
      "limit": 10,
      "offset": 0
    }
  }
}
```

#### Get User
```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Create User
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "roleIds": ["role-uuid"],
  "isActive": true
}
```

#### Update User
```http
PATCH /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "isActive": false,
  "roleIds": ["role-uuid"]
}
```

#### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

### Roles

#### List Roles
```http
GET /api/roles?limit=10&offset=0
Authorization: Bearer <token>
```

#### Get Role
```http
GET /api/roles/:id
Authorization: Bearer <token>
```

#### Create Role
```http
POST /api/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Manager",
  "description": "Manager role",
  "permissionIds": ["perm-uuid-1", "perm-uuid-2"]
}
```

#### Update Role
```http
PATCH /api/roles/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Role",
  "description": "Updated description",
  "permissionIds": ["perm-uuid-1"]
}
```

#### Delete Role
```http
DELETE /api/roles/:id
Authorization: Bearer <token>
```

### Assessments

#### List Assessments
```http
GET /api/assessments?limit=10&offset=0
Authorization: Bearer <token>
```

#### Get Assessment
```http
GET /api/assessments/:id
Authorization: Bearer <token>
```

#### Create Assessment
```http
POST /api/assessments
Authorization: Bearer <token>
Content-Type: application/json

{
  "packageName": "Technical Skills",
  "clerkUserId": "user-id"
}
```

#### Update Assessment
```http
PATCH /api/assessments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "currentQuestionIndex": 10
}
```

#### Delete Assessment
```http
DELETE /api/assessments/:id
Authorization: Bearer <token>
```

### Bulk Operations

#### Bulk Delete
```http
POST /api/bulk/delete
Authorization: Bearer <token>
Content-Type: application/json

{
  "ids": ["uuid-1", "uuid-2"],
  "resource": "users" | "roles" | "assessments"
}
```

**Response:**
```json
{
  "data": {
    "deletedCount": 2,
    "errors": []
  }
}
```

#### Bulk Update
```http
POST /api/bulk/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "ids": ["uuid-1", "uuid-2"],
  "resource": "users",
  "updates": {
    "isActive": true
  }
}
```

**Response:**
```json
{
  "data": {
    "updatedCount": 2,
    "errors": []
  }
}
```

### Audit Trail

#### List Audit Logs
```http
GET /api/audit?limit=50&offset=0&action=create&resource=user
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (number): Results per page
- `offset` (number): Pagination offset
- `userId` (string): Filter by user ID
- `action` (string): Filter by action (create, update, delete, etc.)
- `resource` (string): Filter by resource type
- `status` (string): Filter by status (success, failure, error)
- `startDate` (string): ISO date string
- `endDate` (string): ISO date string

#### Get Resource Audit Logs
```http
GET /api/audit/resource/:resource/:resourceId?limit=50
Authorization: Bearer <token>
```

#### Get User Audit Logs
```http
GET /api/audit/user/:userId?limit=100
Authorization: Bearer <token>
```

### AI Service

#### Generate Content
```http
POST /api/ai/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "question" | "summary",
  "prompt": "Generate a question about...",
  "context": {...}
}
```

**Response:**
```json
{
  "data": {
    "content": "Generated content...",
    "provider": "openai",
    "model": "gpt-4"
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "statusCode": 400
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Rate Limiting

AI endpoints have rate limiting:
- Default: 100 requests per minute per user
- Configurable via environment variables

## Pagination

List endpoints support pagination:
- `limit`: Number of items per page (default: 10)
- `offset`: Number of items to skip (default: 0)

## Filtering

Many endpoints support filtering via query parameters:
- `search`: Text search
- `status`: Status filter
- Date ranges for time-based filtering

## Permissions

All endpoints (except auth) require appropriate permissions:
- Format: `resource:action`
- Examples: `users:read`, `roles:create`, `assessments:delete`

