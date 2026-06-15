import { AuthService } from '../../src/modules/auth/auth.service';

describe('AuthService', () => {
  it('register with existing email throws conflict', async () => {
    await AuthService.register({
      email: 'test@test.com',
      password: 'Test1234',
      role: 'student'
    });
    await expect(AuthService.register({
      email: 'test@test.com', 
      password: 'Test1234',
      role: 'student'
    })).rejects.toThrow();
  });

  it('login with wrong password throws error', async () => {
    await AuthService.register({
      email: 'test2@test.com',
      password: 'Test1234',
      role: 'student'
    });
    await expect(AuthService.login({
      email: 'test2@test.com',
      password: 'wrongpassword'
    })).rejects.toThrow();
  });

  it('register returns token and user without passwordHash', async () => {
    const result = await AuthService.register({
      email: 'test3@test.com',
      password: 'Test1234',
      role: 'student'
    });
    expect(result.token).toBeDefined();
    expect(result.user.passwordHash).toBeUndefined();
  });
});
