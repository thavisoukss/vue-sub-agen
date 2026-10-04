# Backend — NestJS API

ระบบ REST API สำหรับจัดการ Authentication และข้อมูลลูกค้า  
สร้างด้วย **NestJS** + **native SQL** (node-postgres) + **PostgreSQL**

---

## Tech Stack

| Package | หน้าที่ |
|---------|---------|
| `@nestjs/core` | NestJS framework หลัก |
| `@nestjs/jwt` | สร้างและตรวจสอบ JWT token |
| `@nestjs/passport` + `passport-jwt` | Strategy สำหรับ JWT authentication |
| `pg` (node-postgres) | เชื่อมต่อ PostgreSQL ด้วย raw SQL |
| `bcrypt` | แฮชและตรวจสอบรหัสผ่าน |
| `class-validator` | ตรวจสอบความถูกต้องของ request body |
| `@nestjs/config` | อ่านค่าจากไฟล์ `.env` |

---

## โครงสร้างโฟลเดอร์

```
src/
├── main.ts                          ← Entry point: เปิด CORS, ValidationPipe, listen port
├── app.module.ts                    ← Root module: นำ module ทั้งหมดมารวม
│
├── database/
│   └── database.module.ts           ← สร้าง pg.Pool และ export เป็น DATABASE_POOL token
│
├── auth/
│   ├── auth.module.ts               ← Import JwtModule, PassportModule
│   ├── auth.controller.ts           ← Route: POST /auth/register, POST /auth/login
│   ├── auth.service.ts              ← Logic: bcrypt hash, JWT sign
│   ├── jwt.strategy.ts              ← ตรวจสอบ Bearer token ใน header
│   └── dto/
│       ├── register.dto.ts          ← Validate: email + password (min 6 ตัว)
│       └── login.dto.ts             ← Validate: email + password
│
├── customers/
│   ├── customers.module.ts          ← Module ของ customers
│   ├── customers.controller.ts      ← Routes CRUD ทั้งหมด (ใช้ JwtAuthGuard)
│   ├── customers.service.ts         ← Logic: raw SQL queries ทั้งหมด
│   └── dto/
│       ├── create-customer.dto.ts   ← Validate ข้อมูลตอนสร้าง
│       └── update-customer.dto.ts   ← Validate ข้อมูลตอนแก้ไข
│
└── common/
    └── guards/
        └── jwt-auth.guard.ts        ← Guard: ตรวจสอบ JWT ก่อนเข้าถึง endpoint

migrations/
└── 001_init.sql                     ← SQL สร้างตาราง users และ customers
```

---

## การทำงานของแต่ละไฟล์

### `main.ts` — Entry Point

```
เปิดแอป NestJS
├── enableCors()          → อนุญาต request จาก http://localhost:3000 (frontend)
├── useGlobalPipes()      → เปิด ValidationPipe (ตรวจสอบ DTO ทุก request)
└── listen(3001)          → รับฟัง port 3001
```

---

### `database/database.module.ts` — Database Connection

- สร้าง `pg.Pool` โดยอ่านค่าจาก `.env` ผ่าน `ConfigService`
- Export ออกมาเป็น **injection token** ชื่อ `DATABASE_POOL`
- เป็น `@Global()` module → โมดูลอื่นทุกตัวสามารถ inject ได้โดยไม่ต้อง import ซ้ำ

```typescript
// วิธี inject ไปใช้ใน Service อื่น
constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}
```

---

### `auth/auth.service.ts` — Authentication Logic

**register(dto)**
```
1. SELECT users WHERE email = dto.email
2. ถ้ามีอยู่แล้ว → throw ConflictException (409)
3. bcrypt.hash(dto.password, 10)
4. INSERT INTO users (email, password) VALUES (...)
5. return { access_token: JWT }
```

**login(dto)**
```
1. SELECT users WHERE email = dto.email
2. ถ้าไม่มี → throw UnauthorizedException (401)
3. bcrypt.compare(dto.password, user.password)
4. ถ้าไม่ตรง → throw UnauthorizedException (401)
5. return { access_token: JWT }
```

**JWT Payload**
```json
{
  "sub": "uuid-ของ-user",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```
Token มีอายุ **7 วัน**

---

### `auth/jwt.strategy.ts` — Token Verification

- ดึง token จาก `Authorization: Bearer <token>` header
- ตรวจสอบด้วย `JWT_SECRET` จาก `.env`
- ถ้าผ่าน → inject `{ userId, email }` เข้า `req.user` ของ request นั้น

---

### `customers/customers.service.ts` — CRUD Logic

| Method | SQL ที่รัน |
|--------|-----------|
| `findAll()` | `SELECT * FROM customers ORDER BY created_at DESC` |
| `findOne(id)` | `SELECT * FROM customers WHERE id = $1` |
| `create(dto)` | `INSERT INTO customers (name, email, phone, address) VALUES ($1,$2,$3,$4) RETURNING *` |
| `update(id, dto)` | `UPDATE customers SET name=COALESCE($1,name), ... WHERE id=$5 RETURNING *` |
| `remove(id)` | `DELETE FROM customers WHERE id = $1` |

> `COALESCE` ในการ update หมายความว่า ถ้าส่งค่า null มา จะใช้ค่าเดิมของ field นั้น (partial update)

---

## Database Schema

### ตาราง `users`

```sql
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,          -- bcrypt hash เสมอ
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### ตาราง `customers`

```sql
CREATE TABLE customers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255),
  phone      VARCHAR(50),
  address    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ไฟล์ `.env`

```env
DB_HOST=localhost          # host ของ PostgreSQL
DB_PORT=5432               # port ของ PostgreSQL
DB_USER=postgres           # ชื่อ user ของ DB
DB_PASSWORD=postgres       # รหัสผ่าน DB
DB_NAME=customer_db        # ชื่อ database
JWT_SECRET=supersecret...  # secret key สำหรับ sign JWT (เปลี่ยนใน production)
PORT=3001                  # port ที่ API จะรัน
```

---

## API Reference

### Auth

#### `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
```

**Error (409):** Email ซ้ำ  
**Error (400):** email ไม่ถูกรูปแบบ หรือ password สั้นกว่า 6 ตัว

---

#### `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
```

**Error (401):** email หรือ password ไม่ถูกต้อง

---

### Customers (ทุก endpoint ต้องส่ง Header นี้)

```
Authorization: Bearer <access_token>
```

---

#### `GET /customers`

ดึงรายชื่อลูกค้าทั้งหมด

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "สมชาย ใจดี",
    "email": "somchai@example.com",
    "phone": "0812345678",
    "address": "กรุงเทพฯ",
    "created_at": "2026-10-04T00:00:00Z",
    "updated_at": "2026-10-04T00:00:00Z"
  }
]
```

---

#### `GET /customers/:id`

ดึงข้อมูลลูกค้า 1 คน

**Response (200):** object ของลูกค้า  
**Error (404):** ไม่พบลูกค้า

---

#### `POST /customers`

สร้างลูกค้าใหม่

**Request Body:**
```json
{
  "name": "สมชาย ใจดี",
  "email": "somchai@example.com",
  "phone": "0812345678",
  "address": "กรุงเทพฯ"
}
```
> `name` เป็น field บังคับ, ที่เหลือเป็น optional

**Response (201):** object ของลูกค้าที่สร้างใหม่

---

#### `PUT /customers/:id`

แก้ไขข้อมูลลูกค้า (ส่งมาเฉพาะ field ที่ต้องการแก้ไขได้)

**Request Body (ตัวอย่าง):**
```json
{
  "phone": "0899999999"
}
```

**Response (200):** object ของลูกค้าที่อัปเดตแล้ว  
**Error (404):** ไม่พบลูกค้า

---

#### `DELETE /customers/:id`

ลบลูกค้า

**Response (200):**
```json
{ "deleted": true }
```

**Error (404):** ไม่พบลูกค้า

---

## วิธีรัน

```bash
# ติดตั้ง dependencies
npm install

# รันแบบ development (hot reload)
npm run start:dev

# รันแบบ production
npm run start:prod
```

---

## การทดสอบด้วย curl

```bash
# Register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# ดึงลูกค้า (แทน TOKEN ด้วย access_token ที่ได้จาก login)
curl http://localhost:3001/customers \
  -H "Authorization: Bearer TOKEN"

# สร้างลูกค้า
curl -X POST http://localhost:3001/customers \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"สมชาย ใจดี","phone":"0812345678"}'
```
