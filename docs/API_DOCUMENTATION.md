# 📚 API Documentation - BILAN-EASY

**Base URL:** `http://localhost:3001/api` (development)  
**Authentication:** JWT Bearer Token (Header: `Authorization: Bearer <token>`)

---

## 🔐 Authentication Endpoints

### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "isActive": true
    }
  }
}
```

**Errors:**
- `400` - User already exists
- `500` - Server error

---

### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "roles": ["user"],
      "permissions": ["bilan:read", "bilan:assessment:create"]
    }
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `500` - Server error

---

### GET `/api/auth/me`
Get current user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "isActive": true,
    "roles": [
      {
        "id": "uuid",
        "name": "user",
        "description": "Regular user"
      }
    ],
    "permissions": [
      "bilan:read",
      "bilan:assessment:create"
    ]
  }
}
```

---

### GET `/api/auth/permissions`
Get current user's permissions.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "permissions": [
      {
        "resource": "bilan",
        "action": "read",
        "description": "Read bilan assessments"
      }
    ],
    "formatted": [
      "bilan:read",
      "bilan:assessment:create"
    ]
  }
}
```

---

## 👥 User Management Endpoints

### GET `/api/users`
List all users (requires `users:read` permission).

**Query Parameters:**
- `limit` (optional, default: 10) - Number of results per page
- `offset` (optional, default: 0) - Pagination offset
- `search` (optional) - Search by name or email

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "name": "John Doe",
        "isActive": true,
        "lastLoginAt": "2024-11-12T10:00:00Z",
        "roles": [
          {
            "id": "uuid",
            "name": "user"
          }
        ]
      }
    ],
    "pagination": {
      "total": 100,
      "limit": 10,
      "offset": 0
    }
  }
}
```

---

### GET `/api/users/:id`
Get a single user by ID (requires `users:read` permission).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "isActive": true,
    "roles": [...]
  }
}
```

---

### POST `/api/users`
Create a new user (requires `users:create` permission).

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "roleIds": ["role-uuid-1", "role-uuid-2"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "newuser@example.com",
    "name": "New User"
  }
}
```

---

### PATCH `/api/users/:id`
Update a user (requires `users:update` permission).

**Request Body:**
```json
{
  "name": "Updated Name",
  "isActive": true,
  "roleIds": ["role-uuid-1"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Updated Name",
    "isActive": true
  }
}
```

---

### DELETE `/api/users/:id`
Delete a user (requires `users:delete` permission).

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 🔑 Role Management Endpoints

### GET `/api/roles`
List all roles (requires `roles:read` permission).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "id": "uuid",
        "name": "admin",
        "description": "Administrator role",
        "isSystem": true,
        "permissions": [
          {
            "id": "uuid",
            "resource": "users",
            "action": "read"
          }
        ]
      }
    ]
  }
}
```

---

### GET `/api/roles/:id`
Get a single role by ID (requires `roles:read` permission).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "admin",
    "description": "Administrator role",
    "permissions": [...]
  }
}
```

---

### POST `/api/roles`
Create a new role (requires `roles:create` permission).

**Request Body:**
```json
{
  "name": "custom-role",
  "description": "Custom role description",
  "permissionIds": ["permission-uuid-1", "permission-uuid-2"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "custom-role"
  }
}
```

---

### PATCH `/api/roles/:id`
Update a role (requires `roles:update` permission).

**Request Body:**
```json
{
  "name": "updated-role",
  "description": "Updated description",
  "permissionIds": ["permission-uuid-1"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "updated-role"
  }
}
```

---

### DELETE `/api/roles/:id`
Delete a role (requires `roles:delete` permission).

**Response (200):**
```json
{
  "success": true,
  "message": "Role deleted successfully"
}
```

---

## 🔐 Permission Endpoints

### GET `/api/permissions`
List all permissions (requires `permission:read` permission).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "permissions": [
      {
        "id": "uuid",
        "resource": "bilan",
        "action": "read",
        "description": "Read bilan assessments"
      }
    ]
  }
}
```

---

### GET `/api/permissions/by-resource/:resource`
Get permissions filtered by resource.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "permissions": [
      {
        "id": "uuid",
        "resource": "bilan",
        "action": "read"
      },
      {
        "id": "uuid",
        "resource": "bilan",
        "action": "create"
      }
    ]
  }
}
```

---

## 📊 BILAN Assessment Endpoints

### GET `/api/assessments`
List assessments (requires `bilan:assessment:read` permission).

**Query Parameters:**
- `status` (optional) - Filter by status: `in_progress`, `completed`, `abandoned`
- `limit` (optional, default: 10)
- `offset` (optional, default: 0)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "assessments": [
      {
        "id": "uuid",
        "userName": "John Doe",
        "packageName": "Découverte",
        "status": "completed",
        "startedAt": "2024-11-12T10:00:00Z",
        "completedAt": "2024-11-12T12:00:00Z",
        "totalQuestions": 50,
        "currentQuestionIndex": 50
      }
    ],
    "pagination": {
      "total": 100,
      "limit": 10,
      "offset": 0
    }
  }
}
```

---

### GET `/api/assessments/:id`
Get a single assessment by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userName": "John Doe",
    "packageName": "Découverte",
    "status": "completed",
    "answers": [...]
  }
}
```

---

### POST `/api/assessments`
Create a new assessment.

**Request Body:**
```json
{
  "userName": "John Doe",
  "packageId": "decouverte",
  "coachingStyle": "collaborative"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "in_progress"
  }
}
```

---

### PATCH `/api/assessments/:id`
Update an assessment.

**Request Body:**
```json
{
  "status": "completed",
  "currentQuestionIndex": 50
}
```

---

### DELETE `/api/assessments/:id`
Delete an assessment (requires `bilan:assessment:delete` permission).

---

## 📝 Answer Endpoints

### GET `/api/assessments/:assessmentId/answers`
Get all answers for an assessment.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "answers": [
      {
        "id": "uuid",
        "questionId": "q1",
        "value": "Answer text",
        "questionDescription": "Question text",
        "questionType": "text",
        "questionTheme": "skills",
        "answeredAt": "2024-11-12T10:00:00Z"
      }
    ]
  }
}
```

---

### POST `/api/assessments/:assessmentId/answers`
Create a new answer.

**Request Body:**
```json
{
  "questionId": "q1",
  "value": "Answer text",
  "questionDescription": "Question text",
  "questionType": "text",
  "questionTheme": "skills",
  "questionChoices": []
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "value": "Answer text"
  }
}
```

---

### PATCH `/api/assessments/:assessmentId/answers/:answerId`
Update an answer.

**Request Body:**
```json
{
  "value": "Updated answer text"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "value": "Updated answer text"
  }
}
```

---

## 📊 Analytics Endpoints

### GET `/api/admin/analytics`
Get analytics data (requires `analytics:read` or `admin:read` permission).

**Query Parameters:**
- `startDate` (optional) - Start date (ISO 8601)
- `endDate` (optional) - End date (ISO 8601)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalAssessments": 1000,
      "completedAssessments": 800,
      "inProgressAssessments": 150,
      "abandonedAssessments": 50,
      "completionRate": 0.8
    },
    "packageDistribution": {
      "decouverte": 400,
      "approfondi": 350,
      "strategique": 250
    },
    "coachingStyleDistribution": {
      "collaborative": 500,
      "analytical": 300,
      "creative": 200
    },
    "dropOffAnalysis": {
      "phase1": 50,
      "phase2": 30,
      "phase3": 20
    }
  }
}
```

---

## 🚨 Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (missing permission)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🤖 AI Endpoints

### POST `/api/ai/generate/question`
Generate a question for an assessment.

**Authentication:** Required

**Request Body:**
```json
{
  "phaseKey": "phase1",
  "categoryIndex": 0,
  "previousAnswers": [],
  "userName": "John Doe",
  "coachingStyle": "collaborative",
  "userProfile": null,
  "options": {
    "useJoker": false,
    "useGoogleSearch": false
  },
  "language": "fr"
}
```

**Response (200):**
```json
{
  "id": "question_id",
  "text": "Question text",
  "type": "PARAGRAPH",
  "category": "category_name"
}
```

**Errors:**
- `400` - Validation error
- `401` - Unauthorized
- `501` - Not implemented (temporary - AI service migration in progress)

---

### POST `/api/ai/generate/summary`
Generate a summary for completed assessment.

**Authentication:** Required

**Request Body:**
```json
{
  "answers": [...],
  "packageName": "Découverte",
  "userName": "John Doe",
  "coachingStyle": "collaborative",
  "language": "fr"
}
```

**Response (200):**
```json
{
  "profileType": "...",
  "keyStrengths": [...],
  "areasForDevelopment": [...],
  "actionPlan": [...],
  "priorityThemes": [...],
  "recommendations": [...]
}
```

---

### POST `/api/ai/generate/synthesis`
Generate synthesis from last answers.

**Authentication:** Required

**Request Body:**
```json
{
  "lastAnswers": [...],
  "userName": "John Doe",
  "coachingStyle": "collaborative",
  "language": "fr"
}
```

**Response (200):**
```json
{
  "synthesis": "...",
  "confirmationRequest": "..."
}
```

---

### POST `/api/ai/analyze/themes-and-skills`
Analyze themes and skills from answers.

**Authentication:** Required

**Request Body:**
```json
{
  "answers": [...],
  "language": "fr"
}
```

**Response (200):**
```json
{
  "themes": [...],
  "skills": [...]
}
```

---

### POST `/api/ai/analyze/user-profile`
Analyze user profile from CV text.

**Authentication:** Required

**Request Body:**
```json
{
  "cvText": "...",
  "language": "fr"
}
```

**Response (200):**
```json
{
  "fullName": "...",
  "currentRole": "...",
  "keySkills": [...],
  "pastExperiences": [...]
}
```

---

### POST `/api/ai/suggest/optional-module`
Suggest optional module based on answers.

**Authentication:** Required

**Request Body:**
```json
{
  "answers": [...],
  "language": "fr"
}
```

**Response (200):**
```json
{
  "isNeeded": true,
  "moduleId": "module_id",
  "reason": "..."
}
```

---

### POST `/api/ai/find/resource-leads`
Find resource leads for action items.

**Authentication:** Required

**Request Body:**
```json
{
  "actionItemText": "...",
  "language": "fr"
}
```

**Response (200):**
```json
{
  "searchKeywords": [...],
  "resourceTypes": [...],
  "platformExamples": [...]
}
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- JWT tokens expire after 7 days (configurable)
- Password requirements: minimum 8 characters
- All endpoints require authentication except `/api/auth/register` and `/api/auth/login`
- AI endpoints are currently returning 501 (Not Implemented) - AI service migration to backend in progress
- **Security Note**: AI API keys should be stored server-side only. Frontend should use `/api/ai/*` endpoints instead of direct provider calls.

