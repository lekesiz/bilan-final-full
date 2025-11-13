import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import { authRoutes } from '../../routes/auth';
import { db } from '../../db/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

// Mock dependencies
vi.mock('../../db/client');
vi.mock('bcrypt');
vi.mock('jsonwebtoken');

const app = new Hono().route('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed_password',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (db.query.users.findFirst as any) = vi.fn().mockResolvedValue(null);
      (bcrypt.hash as any) = vi.fn().mockResolvedValue('hashed_password');
      (db.insert as any) = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockUser]),
      });
      (jwt.sign as any) = vi.fn().mockReturnValue('mock_token');

      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
    });

    it('should return error if user already exists', async () => {
      (db.query.users.findFirst as any) = vi.fn().mockResolvedValue({
        id: '123',
        email: 'test@example.com',
      });

      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        name: 'Test User',
        isActive: true,
      };

      (db.query.users.findFirst as any) = vi.fn().mockResolvedValue(mockUser);
      (bcrypt.compare as any) = vi.fn().mockResolvedValue(true);
      (db.update as any) = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockUser]),
      });
      (jwt.sign as any) = vi.fn().mockReturnValue('mock_token');

      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
    });

    it('should return error for invalid credentials', async () => {
      (db.query.users.findFirst as any) = vi.fn().mockResolvedValue(null);

      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrong_password',
        }),
      });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toHaveProperty('error');
    });
  });
});

