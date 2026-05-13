# API Reference

All endpoints use **JSON** request/response format.

## Authentication

### POST `/api/auth/signin`

Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com"
  },
  "redirectUrl": "/dashboard"
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "Invalid email or password"
}
```

---

### POST `/api/auth/signup`

Register new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com"
  },
  "redirectUrl": "/dashboard"
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Email already exists or passwords don't match"
}
```

---

### POST `/api/auth/logout`

Clear session and logout user.

**Response (200 OK):**
```json
{
  "message": "Logged out successfully",
  "redirectUrl": "/login"
}
```

---

### GET `/api/auth/session`

Get current authenticated user (requires valid session cookie).

**Response (200 OK):**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com"
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "Not authenticated"
}
```

---

## Keywords

### GET `/api/keywords`

List all keywords for authenticated user.

**Query Parameters:**
- `limit` (optional): Number of keywords to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `search` (optional): Search keyword by text

**Response (200 OK):**
```json
{
  "keywords": [
    {
      "id": "kw_123",
      "userId": "user_123",
      "keyword": "semantic keyword research",
      "searchVolume": 1200,
      "intent": "informational",
      "status": "active",
      "createdAt": "2026-05-13T10:30:00Z"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

---

### POST `/api/keywords`

Bulk import keywords from CSV data.

**Request:**
```json
{
  "keywords": [
    {
      "keyword": "semantic keyword research",
      "searchVolume": 1200,
      "intent": "informational"
    },
    {
      "keyword": "keyword cluster tool",
      "searchVolume": 850,
      "intent": "transactional"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "imported": 2,
  "failed": 0,
  "duplicates": 0
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Invalid CSV format or duplicate keywords"
}
```

---

### DELETE `/api/keywords/[id]`

Delete a keyword by ID.

**Path Parameter:**
- `id`: Keyword ID (required)

**Response (200 OK):**
```json
{
  "message": "Keyword deleted successfully"
}
```

**Error (404 Not Found):**
```json
{
  "error": "Keyword not found"
}
```

---

## CSV

### POST `/api/csv/parse`

Parse and validate uploaded CSV file.

**Request (multipart/form-data):**
- `file`: CSV file

**Response (200 OK):**
```json
{
  "isValid": true,
  "preview": [
    {
      "keyword": "semantic keyword research",
      "searchVolume": 1200,
      "intent": "informational"
    }
  ],
  "total": 500,
  "errors": []
}
```

**Error (400 Bad Request):**
```json
{
  "isValid": false,
  "total": 500,
  "errors": [
    {
      "row": 5,
      "column": "keyword",
      "message": "Required field missing"
    }
  ]
}
```

---

## Health

### GET `/api/health`

Health check endpoint (liveness check for container monitoring).

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-05-13T10:30:00Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (authenticated but not allowed) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Rate Limiting

- No rate limiting implemented in Phase 1
- To be added in Phase 2 if needed

---

## Authentication Details

All endpoints except `/auth/signin` and `/auth/signup` require a valid **session cookie**.

Session cookies are:
- **HttpOnly:** Cannot be accessed via JavaScript (prevents XSS)
- **Secure:** Only sent over HTTPS in production
- **SameSite=Strict:** Prevents CSRF attacks
- **Expiry:** 30 days from login

---

## Example: Complete Sign Up + Import Flow

```bash
# 1. Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }' \
  -c cookies.txt

# 2. Get session
curl -X GET http://localhost:3000/api/auth/session \
  -b cookies.txt

# 3. Upload CSV
curl -X POST http://localhost:3000/api/csv/parse \
  -F "file=@keywords.csv" \
  -b cookies.txt

# 4. Import keywords
curl -X POST http://localhost:3000/api/keywords \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": [
      {"keyword": "keyword 1", "searchVolume": 100},
      {"keyword": "keyword 2", "searchVolume": 200}
    ]
  }' \
  -b cookies.txt

# 5. List keywords
curl -X GET http://localhost:3000/api/keywords \
  -b cookies.txt

# 6. Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

---

**Status:** Complete | **Version:** 1.0 | **Last Updated:** 2026-05-13
