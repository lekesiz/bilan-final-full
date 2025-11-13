# Test Users Guide

This document describes the test users available for development and testing.

## Test Users

### Admin User
- **Email**: `admin@test.com`
- **Password**: `admin123`
- **Role**: Admin (Full Access)
- **Permissions**: All permissions

### Regular User
- **Email**: `user@test.com`
- **Password**: `user123`
- **Role**: User (Basic Access)
- **Permissions**: Can create assessments (`bilan:assessment:create`)

## Creating Test Users

### Option 1: Using the Script (Recommended)

```bash
cd backend
npm run create-test-users
```

This script will:
1. Create Admin and User roles if they don't exist
2. Assign all permissions to Admin role
3. Assign basic permissions to User role
4. Create admin@test.com and user@test.com users
5. Assign appropriate roles to users

### Option 2: Using Seed Script

```bash
cd backend
npm run seed
```

This will create:
- All permissions
- All roles (Admin, User, Viewer, etc.)
- Admin user (email from `ADMIN_EMAIL` env var or `admin@bilan.com`)

### Option 3: Using API

You can also create users via the API:

**Admin User** (requires admin access):
```bash
POST /api/users
Authorization: Bearer <admin_token>
{
  "email": "admin@test.com",
  "password": "admin123",
  "name": "Test Admin",
  "roleIds": ["<admin_role_id>"]
}
```

**Regular User** (public registration):
```bash
POST /api/auth/register
{
  "email": "user@test.com",
  "password": "user123",
  "name": "Test User"
}
```

## Database Connection

If you get a database connection error, check your `backend/.env` file:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/bilan_db
```

**Note**: Make sure:
- PostgreSQL is running
- Database exists
- User has proper permissions
- Connection string format is correct

## Troubleshooting

### Error: "role 'user' does not exist"
This is a PostgreSQL connection error, not related to our User role. Check your `DATABASE_URL`:
- Make sure the username in the connection string is correct
- The format should be: `postgresql://username:password@host:port/database`

### Error: "relation 'users' does not exist"
Run the seed script first:
```bash
cd backend
npm run seed
```

### Users not created
1. Check database connection
2. Verify roles exist (run seed script)
3. Check console for error messages

## Security Note

⚠️ **These are test credentials. Never use them in production!**

In production:
- Use strong, unique passwords
- Don't commit test credentials
- Use environment variables for sensitive data

