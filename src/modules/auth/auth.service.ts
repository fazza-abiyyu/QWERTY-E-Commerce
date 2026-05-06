import { JsonHandler } from '../../infrastructure/database/json-handler';
import { User, LoginPayload, RegisterPayload } from './auth.schema';
import crypto from 'crypto';
import { SignJWT, jwtVerify } from 'jose';

const userDb = new JsonHandler<User>('users.json');

const hashPassword = (password: string) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'qwerty-super-secret-key-123456');

export const AuthService = {
  async login(payload: LoginPayload): Promise<Omit<User, 'password'> | null> {
    const users = await userDb.readAll();
    const hashedPassword = payload.password ? hashPassword(payload.password) : undefined;
    
    const user = users.find(u => u.email === payload.email && u.password === hashedPassword);
    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async register(payload: RegisterPayload): Promise<Omit<User, 'password'>> {
    const users = await userDb.readAll();
    
    // Check if email exists
    if (users.some(u => u.email === payload.email)) {
      throw new Error('Email already registered');
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email: payload.email,
      password: payload.password ? hashPassword(payload.password) : undefined,
      full_name: payload.full_name,
      role: 'customer',
      created_at: new Date().toISOString()
    };

    await userDb.insert(newUser);

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  async generateTokens(user: Omit<User, 'password'>) {
    const access_token = await new SignJWT({ id: user.id, email: user.email, role: user.role, full_name: (user as any).full_name || '', address: (user as any).address || '' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(JWT_SECRET);

    const refresh_token = await new SignJWT({ id: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // Save refresh_token to user DB
    const fullUser = await userDb.findById(user.id);
    if (fullUser) {
      const tokens = fullUser.refresh_tokens || [];
      await userDb.update(user.id, {
        refresh_tokens: [...tokens, refresh_token]
      });
    }

    return { access_token, refresh_token };
  },

  async verifyToken(token: string) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload;
    } catch (e) {
      return null;
    }
  },

  async revokeRefreshToken(userId: string, token: string) {
    const user = await userDb.findById(userId);
    if (user && user.refresh_tokens) {
      await userDb.update(userId, {
        refresh_tokens: user.refresh_tokens.filter(t => t !== token)
      });
    }
  },

  async resetPassword(email: string, newPassword: string): Promise<boolean> {
    const users = await userDb.readAll();
    const user = users.find(u => u.email === email);
    if (!user) return false;

    await userDb.update(user.id, {
      password: hashPassword(newPassword)
    });
    return true;
  }
};
