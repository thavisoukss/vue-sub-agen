import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.module';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findAll() {
    const result = await this.pool.query(
      'SELECT * FROM customers ORDER BY created_at DESC',
    );
    return result.rows;
  }

  async findOne(id: string) {
    const result = await this.pool.query(
      'SELECT * FROM customers WHERE id = $1',
      [id],
    );
    if (!result.rows[0]) throw new NotFoundException('Customer not found');
    return result.rows[0];
  }

  async create(dto: CreateCustomerDto) {
    const result = await this.pool.query(
      `INSERT INTO customers (name, email, phone, address)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [dto.name, dto.email ?? null, dto.phone ?? null, dto.address ?? null],
    );
    return result.rows[0];
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);
    const result = await this.pool.query(
      `UPDATE customers
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           address = COALESCE($4, address),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [dto.name ?? null, dto.email ?? null, dto.phone ?? null, dto.address ?? null, id],
    );
    return result.rows[0];
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.pool.query('DELETE FROM customers WHERE id = $1', [id]);
    return { deleted: true };
  }
}
