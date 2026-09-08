# 📚 Online Comic System Backend

ระบบการ์ตูนออนไลน์ | Backend REST API

บริการเบื้องหลังสำหรับแพลตฟอร์มอ่านและจัดการการ์ตูน พัฒนาด้วย Node.js, Express, Prisma และ PostgreSQL

![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17%2B-4169E1?logo=postgresql&logoColor=white)

---

## 🌟 ภาพรวม

Backend API สำหรับผู้ใช้งาน นักเขียน และผู้ดูแลระบบ รองรับ authentication, การจัดการการ์ตูนและ chapter, ระบบ coin และการชำระเงิน, rating, favorite, follow, comment, ประวัติการอ่าน และ notification

### 🔗 ทางลัด

| รายการ | ลิงก์ |
|---|---|
| API Documentation | [/api-docs](http://localhost:3000/api-docs) |
| OpenAPI JSON | [/api-docs.json](http://localhost:3000/api-docs.json) |
| API Health Check | [/api/health](http://localhost:3000/api/health) |

## 🚀 เริ่มต้นใช้งาน

### ✅ ความต้องการของระบบ

- Node.js 22 ขึ้นไป
- PostgreSQL 17 ขึ้นไป หรือ Docker Desktop
- npm

### 💻 ติดตั้งแบบ Local

```bash
npm install
copy .env.example .env
```

แก้ค่าใน `.env` ให้ตรงกับฐานข้อมูล จากนั้นสร้าง Prisma Client และรัน migration:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

เซิร์ฟเวอร์จะทำงานที่ `http://localhost:3000`

### 🧭 Swagger API Documentation

หลังจากเริ่มเซิร์ฟเวอร์แล้ว เปิดเอกสารแบบ interactive ได้ที่:

- Swagger UI: `http://localhost:3000/api-docs`
- OpenAPI JSON: `http://localhost:3000/api-docs.json`

ใน Swagger UI กด **Authorize** แล้วใส่ `Bearer <accessToken>` เพื่อทดลองเรียก endpoint ที่ต้องเข้าสู่ระบบ

### 🐳 ติดตั้งด้วย Docker Compose

กำหนด `JWT_SECRET` และ `SEED_ADMIN_PASSWORD` ใน environment ของเครื่องก่อนเริ่มใช้งานจริง แล้วรัน:

```bash
docker compose up --build
```

Docker Compose จะเริ่ม PostgreSQL, deploy migration และเปิด API ที่ `http://localhost:3000`

## ⚙️ Environment Variables

| ตัวแปร | จำเป็น | ค่าเริ่มต้น | รายละเอียด |
|---|---:|---|---|
| `DATABASE_URL` | ใช่ | - | Connection string ของ PostgreSQL |
| `PORT` | ไม่ | `3000` | พอร์ตของ API |
| `JWT_SECRET` | ใช่ | - | Secret สำหรับ sign JWT |
| `JWT_ACCESS_TOKEN_EXPIRES_IN` | ไม่ | `15m` | อายุ access token เช่น `15m`, `1h` |
| `JWT_REFRESH_TOKEN_EXPIRES_IN_MINUTES` | ไม่ | `10080` | อายุ refresh token เป็นนาที |
| `EMAIL_VERIFICATION_TOKEN_EXPIRES_IN_MINUTES` | ไม่ | `1440` | อายุ token ยืนยันอีเมล |
| `PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES` | ไม่ | `30` | อายุ token ตั้งรหัสผ่านใหม่ |
| `SEED_ADMIN_PASSWORD` | ใช้ตอน seed | - | รหัสผ่าน admin เริ่มต้น |
| `NODE_ENV` | ไม่ | `development` | ใช้ `production` เมื่อ deploy |

## 📡 ข้อมูลพื้นฐานของ API

- Base URL: `http://localhost:3000/api`
- ตรวจสอบสถานะระบบ: `GET /api/health`
- Request ที่ส่ง JSON ต้องใช้ header `Content-Type: application/json`
- Endpoint ที่มีเครื่องหมาย 🔒 ต้องส่ง header `Authorization: Bearer <accessToken>`
- Error response มีรูปแบบดังนี้:

```json
{
  "success": false,
  "message": "ข้อความผิดพลาด"
}
```

## 🔐 Authentication

### ✍️ สมัครสมาชิก

`POST /api/auth/register`

```json
{
  "email": "user@example.com",
  "username": "reader01",
  "password": "Password123!"
}
```

### 🔑 เข้าสู่ระบบ

`POST /api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

นำ access token ที่ได้ไปใช้กับ endpoint ที่ต้องเข้าสู่ระบบ:

```http
Authorization: Bearer <accessToken>
```

## 🗂️ รายการ Endpoint

### 🔐 Auth `/auth`

| Method | Path | Auth | รายละเอียด |
|---|---|:---:|---|
| POST | `/register` | - | สมัครสมาชิก |
| POST | `/login` | - | เข้าสู่ระบบ |
| POST | `/refresh` | - | ขอ access token ใหม่ โดยส่ง `refreshToken` |
| POST | `/logout` | 🔒 | ออกจากระบบของ session ปัจจุบัน |
| POST | `/logout-all` | 🔒 | ออกจากระบบทุกอุปกรณ์ |
| GET | `/me` | 🔒 | ดูข้อมูลผู้ใช้ปัจจุบัน |
| GET, POST | `/verify-email` | - | ยืนยันอีเมลด้วย token |
| POST | `/resend-verification` | - | ส่งอีเมลยืนยันใหม่ โดยส่ง `email` |
| POST | `/forgot-password`, `/forget-password` | - | ขอ token สำหรับลืมรหัสผ่าน |
| POST | `/reset-password` | - | ตั้งรหัสผ่านใหม่ด้วย `token`, `newPassword` |
| PATCH | `/change-password` | 🔒 | เปลี่ยนรหัสผ่าน |
| PATCH | `/update-profile` | 🔒 | แก้ไขข้อมูล profile |
| PATCH | `/update-email`, `/updateemail` | 🔒 | เปลี่ยนอีเมล |
| DELETE | `/delete-account`, `/deleteaccount` | 🔒 | ลบบัญชี |

### 📖 การ์ตูนสาธารณะ `/public`

| Method | Path | Auth | รายละเอียด |
|---|---|:---:|---|
| GET | `/` | - | ค้นหาการ์ตูนสาธารณะ รองรับ `title`, `comicname`, `tag`, `tags`, `category`, `categorys`, `sort`, `page` และ `limit` |
| GET | `/most-view` | - | การ์ตูนที่มียอดอ่านสูงสุด |
| GET | `/top-rated` | - | การ์ตูนที่มีคะแนนสูง |
| GET | `/most-followed` | - | การ์ตูนที่มีผู้ติดตามมาก |
| GET | `/most-favorite` | - | การ์ตูนที่มีผู้ชื่นชอบมาก |
| GET | `/user?username=...&sort=latest&page=1&limit=20` | - | ค้นหาผู้ใช้จาก username รองรับ `sort`: `latest`, `oldest`, `username` |
| GET | `/user/:userId` | - | ดูการ์ตูนสาธารณะทั้งหมดของผู้ใช้ เรียงจากใหม่ไปเก่า |
| GET | `/:comicId` | - | รายละเอียดการ์ตูน |

### 🛠️ จัดการการ์ตูน `/comic-manage`

| Method | Path | Auth | รายละเอียด |
|---|---|:---:|---|
| GET | `/` | 🔒 | รายการการ์ตูนของผู้ใช้ |
| GET | `/:id` | 🔒 | ดูการ์ตูนของผู้ใช้ |
| GET | `/:id/statistic` | 🔒 | ดูสถิติการ์ตูน |
| POST | `/` | 🔒 | สร้างการ์ตูน |
| PATCH | `/:id` | 🔒 | แก้ไขการ์ตูน |
| DELETE | `/:id` | 🔒 | ลบการ์ตูน |

รองรับ alias เดิม `/api/comicmanage` ด้วย

### 📄 Chapter `/chapter`

| Method | Path | Auth | รายละเอียด |
|---|---|:---:|---|
| GET | `/` | - | รายการ chapter |
| GET | `/:chapterId` | - | รายละเอียด chapter |
| GET | `/:chapterId/content` | บางกรณี | อ่านเนื้อหา chapter; ระบบตรวจ token เมื่อมีการส่งมา |
| POST | `/` | 🔒 | สร้าง chapter |
| PATCH | `/:chapterId` | 🔒 | แก้ไข chapter |
| PUT | `/:chapterId/pages` | 🔒 | แทนที่รายการหน้าของ chapter |
| DELETE | `/:chapterId` | 🔒 | ลบ chapter |
| POST | `/:chapterId/unlock` | 🔒 | ปลดล็อก chapter ด้วย coin |

### 🏷️ หมวดหมู่และแท็ก

`/category` และ `/tag` ใช้เมธอดเหมือนกัน:

| Method | Path | Auth | รายละเอียด |
|---|---|:---:|---|
| GET | `/` | - | รายการทั้งหมด |
| GET | `/:id` | - | ดูรายการเดียว |
| POST | `/` | 🔒 | เพิ่มรายการ |
| PATCH | `/:id` | 🔒 | แก้ไขรายการ |
| DELETE | `/:id` | 🔒 | ลบรายการ |

### ❤️ ปฏิสัมพันธ์กับการ์ตูน

| กลุ่ม | Method | Path | Auth | รายละเอียด |
|---|---|---|:---:|---|
| Rating | GET | `/rating/:comicId` | - | ดูคะแนนของการ์ตูน |
| Rating | GET | `/rating/:comicId/me` | 🔒 | ดูคะแนนของผู้ใช้ปัจจุบัน |
| Rating | POST | `/rating/:comicId` | 🔒 | ให้คะแนนหรือบันทึกคะแนน |
| Rating | DELETE | `/rating/:comicId` | 🔒 | ลบคะแนน |
| Favorite | GET | `/favorite` | 🔒 | รายการการ์ตูนที่ชื่นชอบ |
| Favorite | POST | `/favorite/:comicId` | 🔒 | เพิ่มรายการโปรด |
| Favorite | DELETE | `/favorite/:comicId` | 🔒 | นำออกจากรายการโปรด |
| Follow | GET | `/follow` | 🔒 | รายการการ์ตูนที่ติดตาม |
| Follow | POST | `/follow/:comicId` | 🔒 | ติดตามการ์ตูน |
| Follow | DELETE | `/follow/:comicId` | 🔒 | เลิกติดตาม |
| Comment | GET | `/comment/:chapterId` | - | ดูความคิดเห็นของ chapter |
| Comment | POST | `/comment/:chapterId` | 🔒 | เพิ่มความคิดเห็น |
| Comment | PATCH | `/comment/:commentId` | 🔒 | แก้ไขความคิดเห็น |
| Comment | DELETE | `/comment/:commentId` | 🔒 | ลบความคิดเห็น |

### 📤 Upload `/upload`

ใช้ `multipart/form-data` และชื่อ field เป็น `image`

| Method | Path | Auth | รายละเอียด |
|---|---|:---:|---|
| POST | `/cover` | 🔒 | อัปโหลดรูปปก |
| POST | `/chapter` | 🔒 | อัปโหลดรูปหน้า chapter |
| POST | `/avatar` | 🔒 | อัปโหลดรูปโปรไฟล์ |
| DELETE | `/` | 🔒 | ลบไฟล์ที่อัปโหลด |

### 💳 Coin และการชำระเงิน

| Method | Path | Auth | รายละเอียด |
|---|---|:---:|---|
| GET | `/package`, `/package/:packageId` | - | ดู package coin |
| POST | `/package` | 🔒 | เพิ่ม package coin |
| PATCH | `/package/:packageId` | 🔒 | แก้ไข package coin |
| DELETE | `/package/:packageId` | 🔒 | ลบ package coin |
| GET | `/wallet` | 🔒 | ดูยอด coin ในกระเป๋า |
| GET | `/wallet/history` | 🔒 | ดูประวัติ coin |
| POST | `/payment/purchase` | 🔒 | ซื้อ coin |
| GET | `/payment/status/:paymentTransactionId` | 🔒 | ตรวจสอบสถานะการชำระเงิน |
| GET | `/payment/history` | 🔒 | ดูประวัติการชำระเงิน |
| GET | `/payment-method`, `/paymentmethod` | - | ดูวิธีชำระเงิน |
| GET | `/payment-method/:paymentMethodId` | - | ดูวิธีชำระเงินรายการเดียว |
| POST | `/payment-method` | 🔒 | เพิ่มวิธีชำระเงิน |
| PATCH | `/payment-method/:paymentMethodId` | 🔒 | แก้ไขวิธีชำระเงิน |
| DELETE | `/payment-method/:paymentMethodId` | 🔒 | ลบวิธีชำระเงิน |

### 🔔 ประวัติและการแจ้งเตือน

| Method | Path | Auth | รายละเอียด |
|---|---|:---:|---|
| GET | `/history` | 🔒 | ดูประวัติการอ่าน |
| GET | `/notification` | 🔒 | ดูการแจ้งเตือน |
| PATCH | `/notification/:notificationId/read` | 🔒 | ทำเครื่องหมายว่าอ่านแล้ว |

### 👑 Admin `/admin`

Endpoint กลุ่มนี้ต้องใช้ access token ของผู้ดูแลระบบ

| Method | Path | Auth | รายละเอียด |
|---|---|:---:|---|
| GET | `/statistic` | 🔒 | ดูสถิติระบบ |
| PATCH | `/users/:id/ban` | 🔒 | ระงับผู้ใช้ |
| PATCH | `/users/:id/unban` | 🔒 | ยกเลิกการระงับผู้ใช้ |
| GET | `/transactions` | 🔒 | ดูรายการธุรกรรม |

## 🧪 ตัวอย่างการเรียก API

ตรวจสอบระบบ:

```bash
curl http://localhost:3000/api/health
```

เข้าสู่ระบบและอ่านข้อมูลผู้ใช้:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}'

curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

อ่านรายละเอียดการ์ตูนและปลดล็อก chapter:

```bash
curl http://localhost:3000/api/comic-public/1

curl -X POST http://localhost:3000/api/chapter/10/unlock \
  -H "Authorization: Bearer <accessToken>"
```

อัปโหลดรูป:

```bash
curl -X POST http://localhost:3000/api/upload/cover \
  -H "Authorization: Bearer <accessToken>" \
  -F "image=@./cover.jpg"
```

## 🔧 คำสั่งที่ใช้บ่อย

```bash
npm run dev             # รัน development server
npm run start           # รัน production server
npm test                # รันชุดทดสอบ
npm run build           # ตรวจสอบและ compile TypeScript
npm run prisma:studio   # เปิด Prisma Studio
npm run prisma:migrate  # สร้างและรัน migration สำหรับ development
npm run prisma:deploy   # deploy migration ที่มีอยู่
```

## 📁 โครงสร้างโปรเจกต์

```text
src/
  app/                  # Express app และการลงทะเบียน routes
  configs/              # การตั้งค่า environment และฐานข้อมูล
  middlewares/          # auth, upload และ error handler
  modules/              # controller, service, model และ route แยกตามฟีเจอร์
prisma/
  schema.prisma         # โครงสร้างฐานข้อมูล
  migrations/            # Prisma migrations
public/uploads/         # ไฟล์ที่อัปโหลด
 tests/                  # ชุดทดสอบ Jest และ Supertest
```
