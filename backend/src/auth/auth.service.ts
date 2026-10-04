import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.module';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.pool.query(
      'SELECT id FROM users WHERE email = $1',
      [dto.email],
    );
    if (existing.rows.length > 0) {
      throw new ConflictException('Email already registered');
    }
    const hash = await bcrypt.hash(dto.password, 10);
    const result = await this.pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
      [dto.email, hash],
    );
    const user = result.rows[0];
    return { access_token: this.sign(user.id, user.email) };
  }

  async login(dto: LoginDto) {
    const result = await this.pool.query(
      'SELECT id, email, password FROM users WHERE email = $1',
      [dto.email],
    );
    const user = result.rows[0];
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return { access_token: this.sign(user.id, user.email) };
  }

  private sign(userId: string, email: string) {
    return this.jwtService.sign({ sub: userId, email });
  }
}
