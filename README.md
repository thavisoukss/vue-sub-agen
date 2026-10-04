# CRM Full-Stack Project

ระบบจัดการลูกค้า (Customer Relationship Management) แบบ Full-Stack พร้อมระบบ Register / Login และ CRUD สำหรับข้อมูลลูกค้า

---

## Tech Stack

| ส่วน | เทคโนโลยี | Port |
|------|-----------|------|
| Frontend | Nuxt 3 + Nuxt UI + Tailwind CSS | 3000 |
| Backend | NestJS + native SQL (pg) | 3001 |
| Database | PostgreSQL | 5432 |

---

## โครงสร้างโปรเจกต์

```
Sub-Agen/
│
├── backend/                  ← NestJS REST API
│   ├── src/
│   │   ├── app.module.ts     ← Root module
│   │   ├── main.ts           ← Entry point
│   │   ├── database/         ← pg.Pool provider
│   │   ├── auth/             ← Register / Login / JWT
│   │   ├── customers/        ← CRUD ลูกค้า
│   │   └── common/guards/    ← JWT Guard
│   ├── migrations/
│   │   └── 001_init.sql      ← SQL สร้างตาราง
│   └── .env                  ← ตั้งค่า DB + JWT
│
└── frontend/                 ← Nuxt 3 SPA
    └── app/
        ├── stores/           ← Pinia (auth state)
        ├── composables/      ← useAuth, useCustomers
        ├── middleware/       ← ป้องกันหน้าที่ต้อง login
        └── pages/
            ├── login.vue
            ├── register.vue
            └── customers/    ← list / create / edit
```

---

## การติดตั้งและรัน

### 1. สร้าง Database

```bash
# สร้าง database
psql -U postgres -c "CREATE DATABASE customer_db;"

# รัน migration สร้างตาราง
psql -U postgres -d customer_db -f backend/migrations/001_init.sql
```

### 2. ตั้งค่า Backend

แก้ไขไฟล์ `backend/.env` ให้ตรงกับ PostgreSQL ของคุณ:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=customer_db
JWT_SECRET=supersecret_change_in_production
PORT=3001
```

### 3. รัน Backend

```bash
cd backend
npm run start:dev
```

API พร้อมใช้งานที่ `http://localhost:3001`

### 4. รัน Frontend

```bash
cd frontend
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:3000`

---

## Flow การทำงานของระบบ

```
ผู้ใช้เปิด http://localhost:3000
        │
        ▼
   มี token ใน localStorage?
   ┌─────┴─────┐
  ไม่มี        มี
   │            │
   ▼            ▼
/login      /customers (หน้ารายชื่อลูกค้า)
   │
   ▼
กรอก email + password
   │
   ▼
POST /auth/login → Backend
   │
   ▼
ได้รับ JWT token → เก็บใน localStorage
   │
   ▼
/customers (หน้ารายชื่อลูกค้า)
```

---

## API Endpoints สรุป

| Method | Endpoint | คำอธิบาย | Auth |
|--------|----------|----------|------|
| POST | /auth/register | สมัครบัญชีใหม่ | ไม่ต้องการ |
| POST | /auth/login | เข้าสู่ระบบ | ไม่ต้องการ |
| GET | /customers | ดึงรายชื่อลูกค้าทั้งหมด | ต้องการ JWT |
| GET | /customers/:id | ดึงข้อมูลลูกค้า 1 คน | ต้องการ JWT |
| POST | /customers | สร้างลูกค้าใหม่ | ต้องการ JWT |
| PUT | /customers/:id | แก้ไขข้อมูลลูกค้า | ต้องการ JWT |
| DELETE | /customers/:id | ลบลูกค้า | ต้องการ JWT |

---

## ข้อมูลเพิ่มเติม

- [รายละเอียด Backend](./backend/README.md)
- [รายละเอียด Frontend](./frontend/README.md)
