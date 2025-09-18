import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

interface AuthResponse {
  user?: Partial<Omit<User, 'password' | 'verificationToken'>>;
  token?: string;
}

const userRepository = AppDataSource.getRepository(User);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class AuthService {
  static async register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const existingUser = await userRepository.findOne({
      where: { email: userData.email },
    });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = userRepository.create({
      ...userData,
      password: hashedPassword,
      verificationToken,
    });

    const savedUser = await userRepository.save(user);

    // TODO: Send verification email with token
    return {
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        isVerified: savedUser.isVerified,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
      },
    };
  }

  static async verify(token: string): Promise<AuthResponse> {
    const user = await userRepository.findOne({
      where: { verificationToken: token },
    });
    if (!user) {
      throw new Error('Invalid verification token');
    }

    user.isVerified = true;
    user.verificationToken = ''; // Use empty string instead of null
    const verifiedUser = await userRepository.save(user);

    return {
      user: {
        id: verifiedUser.id,
        name: verifiedUser.name,
        email: verifiedUser.email,
        isVerified: verifiedUser.isVerified,
        createdAt: verifiedUser.createdAt,
        updatedAt: verifiedUser.updatedAt,
      },
    };
  }

  static async login(credentials: { email: string; password: string }) {
    const user = await userRepository.findOne({
      where: { email: credentials.email },
    });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new Error('Please verify your email first');
    }

    const isValidPassword = await bcrypt.compare(
      credentials.password,
      user.password
    );
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '1d',
    });
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  }
}
