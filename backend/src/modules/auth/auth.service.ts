import jwt, { SignOptions } from 'jsonwebtoken';
import { User, Role, AuditLog, CareerProfile } from '../../database/models';

export class AuthService {
  static async registerUser(email: string, passwordHash: string, role: Role, ip?: string, userAgent?: string) {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: 'Email is already registered', code: 409 };
    }

    // Create user
    const user = new User({ email, passwordHash, role });
    await user.save();

    // Create a base career profile for the user
    const profile = new CareerProfile({
      userId: user._id,
      createdBy: user._id,
      updatedBy: user._id,
      version: 1
    });
    await profile.save();

    // Create Audit Log
    await AuditLog.create({
      actor: user._id,
      actorEmail: email,
      action: 'account_registered',
      ip,
      userAgent,
      timestamp: new Date()
    });

    return { user };
  }

  static async loginUser(email: string, ip?: string, userAgent?: string) {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      // Audit log failed login
      await AuditLog.create({
        actorEmail: email,
        action: 'login_failed',
        ip,
        userAgent,
        timestamp: new Date()
      });
      return { error: 'Invalid credentials', code: 401 };
    }

    return { user };
  }

  static generateToken(userId: string, email: string, role: Role): string {
    const jwtSecret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    const options: SignOptions = { expiresIn: expiresIn as any };
    return jwt.sign({ userId, email, role }, jwtSecret, options);
  }

  static async logSuccessfulLogin(userId: string, email: string, ip?: string, userAgent?: string) {
    await AuditLog.create({
      actor: userId,
      actorEmail: email,
      action: 'login_success',
      ip,
      userAgent,
      timestamp: new Date()
    });
  }
}
