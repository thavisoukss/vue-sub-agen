# Frontend — Nuxt 3 App

ส่วนหน้าบ้าน (Frontend) ของระบบ CRM สำหรับ Register / Login และจัดการข้อมูลลูกค้า  
สร้างด้วย **Nuxt 3** + **Nuxt UI** + **Tailwind CSS** + **Pinia**

---

## Tech Stack

| Package | หน้าที่ |
|---------|---------|
| `nuxt` | Framework หลักของ Frontend |
| `@nuxt/ui` | Component library (UCard, UTable, UInput, UButton ฯลฯ) |
| `tailwindcss` | Utility-first CSS framework |
| `pinia` + `@pinia/nuxt` | State management สำหรับเก็บสถานะ login |

---

## โครงสร้างโฟลเดอร์ (ภายใน `app/`)

```
app/
│
├── app.vue                        ← Layout หลัก: Header (ชื่อแอป + Logout) + <NuxtPage>
│
├── stores/
│   └── auth.ts                    ← Pinia store: เก็บ token + email + สถานะ login
│
├── composables/
│   ├── useAuth.ts                 ← ฟังก์ชัน register(), login(), logout()
│   └── useCustomers.ts            ← ฟังก์ชัน CRUD ลูกค้าทั้งหมด
│
├── middleware/
│   └── auth.ts                    ← Guard: redirect ไป /login ถ้าไม่มี token
│
└── pages/
    ├── index.vue                  ← Redirect อัตโนมัติ (→ /customers หรือ /login)
    ├── login.vue                  ← หน้า Sign In
    ├── register.vue               ← หน้าสมัครบัญชี
    └── customers/
        ├── index.vue              ← ตารางแสดงลูกค้าทั้งหมด + ปุ่ม Edit/Delete
        ├── create.vue             ← ฟอร์มเพิ่มลูกค้าใหม่
        └── [id]/
            └── edit.vue           ← ฟอร์มแก้ไขข้อมูลลูกค้า
```

---

## การทำงานของแต่ละไฟล์

### `nuxt.config.ts` — การตั้งค่า Nuxt

```typescript
modules: ['@nuxt/ui', '@pinia/nuxt'],   // โหลด Nuxt UI และ Pinia
runtimeConfig: {
  public: {
    apiBase: 'http://localhost:3001'    // URL ของ Backend API
  }
}
```

> ถ้าต้องการเปลี่ยน URL ของ Backend ให้แก้ตรงนี้เพียงจุดเดียว

---

### `stores/auth.ts` — Pinia Store (State Management)

เก็บสถานะ Authentication ของผู้ใช้ระหว่างที่แอปทำงาน

**State (ข้อมูลที่เก็บ):**

| ชื่อ | ประเภท | คำอธิบาย |
|------|--------|----------|
| `token` | string / null | JWT token ที่ได้จาก Backend |
| `email` | string / null | อีเมลของผู้ใช้ที่ login อยู่ |

**Getter:**

| ชื่อ | คำอธิบาย |
|------|----------|
| `isAuthenticated` | คืนค่า `true` ถ้ามี token |

**Actions (ฟังก์ชัน):**

| ฟังก์ชัน | สิ่งที่ทำ |
|---------|---------|
| `setAuth(token, email)` | เก็บ token + email ทั้งใน store และ `localStorage` |
| `loadFromStorage()` | โหลด token กลับมาจาก `localStorage` ตอนเปิดหน้าเว็บใหม่ |
| `logout()` | ลบ token ทั้งจาก store และ `localStorage` |

> **ทำไมต้องใช้ `localStorage`?**  
> เพราะ Pinia store จะถูกล้างทุกครั้งที่ refresh หน้า  
> การเก็บใน `localStorage` ทำให้ผู้ใช้ยังคง login อยู่แม้จะ refresh

---

### `composables/useAuth.ts` — Authentication Functions

ทำหน้าที่เชื่อมต่อกับ Backend สำหรับ register และ login

**`register(email, password)`**
```
1. POST /auth/register → Backend
2. รับ access_token กลับมา
3. store.setAuth(token, email)
4. redirect ไปหน้า /customers
```

**`login(email, password)`**
```
1. POST /auth/login → Backend
2. รับ access_token กลับมา
3. store.setAuth(token, email)
4. redirect ไปหน้า /customers
```

**`logout()`**
```
1. store.logout() → ลบ token
2. redirect ไปหน้า /login
```

---

### `composables/useCustomers.ts` — Customer CRUD Functions

ทำหน้าที่เชื่อมต่อกับ Backend สำหรับจัดการข้อมูลลูกค้า  
ทุกคำสั่งจะแนบ `Authorization: Bearer <token>` ไปใน header อัตโนมัติ

| ฟังก์ชัน | HTTP | Endpoint | คำอธิบาย |
|---------|------|----------|---------|
| `list()` | GET | /customers | ดึงลูกค้าทั้งหมด |
| `get(id)` | GET | /customers/:id | ดึงลูกค้า 1 คน |
| `create(body)` | POST | /customers | สร้างลูกค้าใหม่ |
| `update(id, body)` | PUT | /customers/:id | แก้ไขข้อมูลลูกค้า |
| `remove(id)` | DELETE | /customers/:id | ลบลูกค้า |

**Customer Interface (TypeScript):**
```typescript
interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}
```

---

### `middleware/auth.ts` — Route Guard

ทำงานทุกครั้งที่ผู้ใช้พยายามเข้าหน้าที่มี `definePageMeta({ middleware: 'auth' })`

```
1. loadFromStorage()       → โหลด token จาก localStorage
2. ตรวจสอบ isAuthenticated
   ├── false → redirect ไป /login
   └── true  → อนุญาตให้เข้าหน้านั้นได้
```

หน้าที่ใช้ middleware นี้: `/customers`, `/customers/create`, `/customers/:id/edit`

---

## หน้าต่างๆ ในระบบ

### `pages/index.vue` — หน้าแรก
- ไม่มีเนื้อหาแสดงผล
- ตรวจสอบสถานะ login แล้ว redirect อัตโนมัติ
  - มี token → `/customers`
  - ไม่มี token → `/login`

---

### `pages/login.vue` — หน้า Sign In

**สิ่งที่มี:**
- ฟอร์ม email + password
- ปุ่ม Sign In (แสดง loading ขณะรอ)
- แสดง error message ถ้า login ไม่สำเร็จ
- ลิงก์ไปหน้า Register

**Flow:**
```
กรอก email + password → submit → useAuth.login()
→ สำเร็จ: redirect /customers
→ ไม่สำเร็จ: แสดง error (เช่น "Invalid credentials")
```

---

### `pages/register.vue` — หน้าสมัครบัญชี

**สิ่งที่มี:**
- ฟอร์ม email + password + confirm password
- ตรวจสอบ password ตรงกันก่อนส่งไป Backend
- แสดง error message ถ้าสมัครไม่สำเร็จ
- ลิงก์กลับไปหน้า Login

**Flow:**
```
กรอกข้อมูล → ตรวจสอบ password ตรงกัน
→ ไม่ตรง: แสดง "Passwords do not match"
→ ตรง: submit → useAuth.register()
  → สำเร็จ: redirect /customers
  → ไม่สำเร็จ: แสดง error (เช่น "Email already registered")
```

---

### `pages/customers/index.vue` — หน้ารายชื่อลูกค้า

**สิ่งที่มี:**
- ตาราง (`UTable`) แสดงลูกค้าทั้งหมด มีคอลัมน์: Name, Email, Phone, Address, Actions
- ปุ่ม **Add Customer** → ไปหน้า `/customers/create`
- ปุ่ม **แก้ไข** (icon ดินสอ) ในแต่ละแถว → ไปหน้า `/customers/:id/edit`
- ปุ่ม **ลบ** (icon trash) ในแต่ละแถว → เปิด Modal ยืนยันก่อนลบ
- Loading state ขณะดึงข้อมูลจาก API

**Flow การลบ:**
```
กดปุ่มลบ → เปิด Modal "Are you sure?"
→ กด Cancel: ปิด Modal
→ กด Delete: useCustomers.remove(id) → โหลดตารางใหม่
```

---

### `pages/customers/create.vue` — หน้าเพิ่มลูกค้าใหม่

**สิ่งที่มี:**
- ฟอร์ม: Name (บังคับ), Email, Phone, Address (textarea)
- ปุ่ม Cancel → กลับหน้าลิสต์
- ปุ่ม Save Customer → ส่งข้อมูลไป Backend

**Flow:**
```
กรอกข้อมูล → submit → useCustomers.create(form)
→ สำเร็จ: redirect /customers
→ ไม่สำเร็จ: แสดง error message
```

---

### `pages/customers/[id]/edit.vue` — หน้าแก้ไขลูกค้า

**สิ่งที่มี:**
- โหลดข้อมูลลูกค้าเดิมมาใส่ฟอร์มก่อน (ผ่าน `useCustomers.get(id)`)
- ฟอร์มเหมือน Create แต่มีข้อมูลเดิมอยู่แล้ว
- แสดง "Loading…" ขณะดึงข้อมูล
- ปุ่ม Save Changes → อัปเดตข้อมูล

**Flow:**
```
เปิดหน้า → useCustomers.get(id) → เติมข้อมูลในฟอร์ม
→ แก้ไขข้อมูล → submit → useCustomers.update(id, form)
→ สำเร็จ: redirect /customers
→ ไม่สำเร็จ: แสดง error message
```

---

### `app.vue` — Layout หลัก

**Header แสดงตามสถานะ login:**

| สถานะ | สิ่งที่แสดงใน Header |
|------|---------------------|
| ไม่ได้ login | ปุ่ม Login + ปุ่ม Register |
| login แล้ว | อีเมลผู้ใช้ + ปุ่ม Logout |

**ปุ่ม Logout** → เรียก `useAuth.logout()` → ลบ token → redirect `/login`

---

## วิธีรัน

```bash
# ติดตั้ง dependencies
npm install

# รัน Development server
npm run dev
# เปิด http://localhost:3000

# Build สำหรับ Production
npm run build
npm run preview
```

---

## Environment Variables

ค่าที่ใช้อยู่ใน `nuxt.config.ts`:

```typescript
runtimeConfig: {
  public: {
    apiBase: 'http://localhost:3001'  // URL ของ Backend
  }
}
```

สามารถ override ด้วย environment variable ชื่อ `NUXT_PUBLIC_API_BASE`:

```bash
NUXT_PUBLIC_API_BASE=https://api.yourdomain.com npm run build
```

---

## Component ที่ใช้จาก Nuxt UI

| Component | ใช้ในหน้า | คำอธิบาย |
|-----------|---------|---------|
| `UCard` | login, register, customers | กล่องเนื้อหา |
| `UTable` | customers/index | ตารางแสดงข้อมูล |
| `UForm` + `UFormField` | ทุกฟอร์ม | โครงสร้างฟอร์ม |
| `UInput` | ทุกฟอร์ม | ช่องกรอกข้อความ |
| `UTextarea` | create, edit | ช่องกรอกหลายบรรทัด (address) |
| `UButton` | ทุกหน้า | ปุ่มต่างๆ |
| `UAlert` | ทุกฟอร์ม | แสดง error message |
| `UModal` | customers/index | popup ยืนยันการลบ |
| `UHeader` | app.vue | แถบ navigation บนสุด |
| `UContainer` | customers | จัดหน้าให้มี max-width |
| `UColorModeButton` | app.vue | ปุ่มสลับ Dark/Light mode |
