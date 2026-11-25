import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}
  async validate(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) throw new UnauthorizedException('Email hoac mat khau khong dung');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Email hoac mat khau khong dung');
    return user;
  }
  tokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role, fullName: user.fullName };
    const accessToken = this.jwt.sign(payload);
    const refreshToken = this.jwt.sign(payload, { secret: process.env.JWT_REFRESH_SECRET || 'thay-doi-refresh-secret-nay', expiresIn: '7d' });
    return { accessToken, refreshToken };
  }
  async login(email: string, password: string) {
    const user = await this.validate(email, password);
    return { ...this.tokens(user), user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } };
  }
  async refresh(refreshToken: string) {
    try {
      const p: any = await this.jwt.verifyAsync(refreshToken, { secret: process.env.JWT_REFRESH_SECRET || 'thay-doi-refresh-secret-nay' });
      const user = await this.prisma.user.findUnique({ where: { id: p.sub } });
      if (!user) throw new UnauthorizedException('Refresh token khong hop le');
      return this.tokens(user);
    } catch { throw new UnauthorizedException('Refresh token khong hop le'); }
  }
}
