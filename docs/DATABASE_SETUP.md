# Database Setup Guide

## Quick Setup

### 1. Create Database

```bash
# Using psql
createdb bilan_easy

# Or using SQL
psql postgres
CREATE DATABASE bilan_easy;
\q
```

### 2. Configure DATABASE_URL

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/bilan_easy
```

**Important**: 
- Replace `your_username` with your PostgreSQL username
- Replace `your_password` with your PostgreSQL password
- If no password, use: `postgresql://your_username@localhost:5432/bilan_easy`

### 3. Run Seed Script

```bash
cd backend
npm run seed
```

This will create:
- All permissions
- All roles (admin, user, viewer)
- Default admin user

### 4. Create Test Users (Optional)

```bash
cd backend
npm run create-test-users
```

This will create:
- `admin@test.com` / `admin123` (Admin role)
- `user@test.com` / `user123` (User role - can create assessments)

## Troubleshooting

### Error: "role 'user' does not exist"

This means PostgreSQL can't find the database user. Check your `DATABASE_URL`:

**Wrong:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/bilan_easy
```

**Correct:**
```env
DATABASE_URL=postgresql://your_actual_username:password@localhost:5432/bilan_easy
```

To find your PostgreSQL username:
```bash
psql postgres -c "SELECT current_user;"
```

### Error: "database 'bilan_easy' does not exist"

Create the database:
```bash
createdb bilan_easy
```

### Error: "password authentication failed"

1. Check your password in `DATABASE_URL`
2. Or use PostgreSQL's trust authentication for local development:
   - Edit `pg_hba.conf` (usually in `/usr/local/var/postgres/` or `/etc/postgresql/`)
   - Change `md5` to `trust` for local connections
   - Restart PostgreSQL

### Connection Refused

Make sure PostgreSQL is running:
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Check status
psql postgres -c "SELECT version();"
```

## Default Admin User

After running `npm run seed`, you can login with:

- **Email**: `admin@bilan.com` (or value from `ADMIN_EMAIL` env var)
- **Password**: `admin123` (or value from `ADMIN_PASSWORD` env var)

## Test Users

After running `npm run create-test-users`:

- **Admin**: `admin@test.com` / `admin123`
- **User**: `user@test.com` / `user123`

