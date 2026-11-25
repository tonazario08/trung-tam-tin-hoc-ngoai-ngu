# Hệ thống Quản lý Trung tâm Tin học - Ngoại ngữ

Đồ án môn **Quản lý dự án phần mềm** — Web quản lý trung tâm tin học - ngoại ngữ:
quản lý học viên, giáo viên, khóa học, lớp học, thời khóa biểu, điểm danh,
điểm, học phí và dashboard.

## Stack

| Tầng | Công nghệ |
| --- | --- |
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS 3 |
| Backend | NestJS 10 + TypeScript |
| Database | PostgreSQL 16 + Prisma 5 |
| Auth | JWT (access 1h) + Refresh Token (7d) + RBAC |
| Cache/queue | Redis 7 — cache `GET /dashboard/overview` 60 giây (fail-open: Redis tắt thì chạy không cache, không crash). Service `redis` trong docker-compose; local chạy `redis-server` rồi backend tự kết nối `REDIS_URL` |

Vai trò (RBAC): `ADMIN`, `ACADEMIC` (giáo vụ), `TEACHER`, `STUDENT`.
Guard `JwtAuthGuard` kiểm tra token và vai trò ở mọi route trừ `/auth/login`,
`/auth/refresh`.

## Cấu trúc thư mục

```
trung-tam-tin-hoc-ngoai-ngu/
├── docker-compose.yml          # postgres + backend + frontend
├── README.md
├── .gitignore
├── backend/
│   ├── Dockerfile
│   ├── package.json            # nest start / build / seed / prisma:*
│   ├── .env.example            # copy thành .env
│   ├── prisma/
│   │   ├── schema.prisma       # 15 bảng: users, teachers, students, courses,
│   │   │                       # classes, rooms, class_schedules, enrollments,
│   │   │   │                       # attendance, grades, invoices, payments,
│   │   │   │                       # leads, certificates, notifications
│   │   ├── migrations/         # migration init (đã tạo bằng prisma migrate dev)
│   │   └── seed.ts             # 5 GV, 20 HV, 6 lớp, 12 ghi danh, 12 hóa đơn
│   └── src/
│       ├── main.ts             # prefix /api, ValidationPipe, CORS
│       ├── app.module.ts
│       ├── prisma/             # PrismaService (Global)
│       ├── common/             # JwtAuthGuard, Roles decorator, pagination
│       ├── auth/               # login, refresh, me (bcryptjs)
│       ├── students/           # CRUD + tìm kiếm/lọc/phân trang + import CSV
│       ├── teachers/           # CRUD (tạo User + Teacher trong 1 lần)
│       ├── courses/            # CRUD khóa học + CRUD phòng học (/rooms)
│       ├── classes/            # CRUD lớp + thêm lịch (kiểm tra trùng)
│       ├── enrollments/        # ghi danh (sĩ số + trùng lớp) + tự tạo invoice
│       ├── attendance/         # điểm danh bulk (upsert theo ngày)
│       ├── grades/             # nhập điểm, kiểm tra 0-10
│       ├── invoices/           # danh sách hóa đơn + thu tiền (PARTIAL/PAID)
│       └── dashboard/          # overview: HV, lớp chạy, doanh thu, quá hạn
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── .env.example            # NEXT_PUBLIC_API_URL=http://localhost:3001/api
    └── src/
        ├── lib/api.ts          # fetch wrapper + token localStorage + fmtVND
        ├── components/         # ui.tsx (Card/Button/Input/Select/Badge), Layout.tsx
        └── app/
            ├── login/          # /login
            ├── dashboard/      # 4 thẻ tổng + lớp hôm nay + hóa đơn quá hạn
            ├── students/       # tìm kiếm + thêm HV + import CSV
            ├── teachers/       # thêm GV
            ├── courses/        # thêm khóa học + xem phòng
            ├── classes/        # mở lớp + danh sách lớp
            ├── classes/[id]/  # ghi danh + thêm lịch (báo trùng)
            ├── schedule/       # thời khóa biểu tuần
            ├── attendance/[classId]/  # điểm danh theo ngày
            ├── tuition/        # lọc hóa đơn + thu tiền
            └── grades/         # nhập điểm + xem điểm
```

## Cách chạy (1 lệnh với Docker)

```bash
docker compose up --build -d
docker compose ps
# Đợi postgres healthy và backend chạy, rồi trong terminal khác:
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run seed
# Nếu báo service "backend" is not running: bạn chưa up, hoặc backend đã crash.
# Compose Phase 2: thêm service redis (redis:7-alpine), backend tự chạy
# prisma migrate deploy khi khởi động (backend/entrypoint.sh) và chỉ seed
# khi DB trống (đếm user == 0), backend có healthcheck gọi /api/health.
# Xem log: docker compose logs backend --tail 100
# Lỗi EADDRINUSE :3000 trên Windows: cổng 3000 đang bị chiếm.
# Kiểm tra: netstat -ano | findstr :3000  rồi  taskkill /PID <PID> /F
# Đừng chạy cả Docker và npm local cùng lúc.
```

Mở http://localhost:3000 — Frontend. Backend: http://localhost:3001/api

> Lưu ý: máy này không có Docker nên `docker compose up` **chưa được test chạy
> thực tế** — file compose + 2 Dockerfile đã viết sẵn theo đúng cấu trúc trên.
> Cách chạy đã test kỹ là cách npm bên dưới.

## Cách chạy bằng npm (đã test trên máy này)

Yêu cầu: Node 20+, PostgreSQL 16 đang chạy, database `trungtam`.

```bash
# 1. Database — trên Linux:
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
sudo -u postgres psql -c "CREATE DATABASE trungtam;"
# Trên Windows: KHÔNG dùng sudo (Windows không có sudo -u postgres).
# Nếu dùng Docker thì không cần tạo DB tay, compose đã tạo sẵn DB trungtam.
# Nếu dùng npm local thì cài PostgreSQL bằng installer, đặt mật khẩu postgres,
# rồi tạo DB bằng pgAdmin hoặc psql của Windows.

# 1b. Redis (tùy chọn, để test cache): cài redis-server rồi chạy `redis-server`
#     (mặc định cổng 6379). Không có Redis thì backend vẫn chạy, dashboard
#     chỉ không cache. Kiểm tra: `redis-cli ping` -> PONG; `GET /api/health`
#     trả redis: "up" (có Redis) hoặc "disabled" (không có).

# 2. Backend (terminal 1)
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy
npm run seed
npm run build
npm run start:prod        # chạy tại http://localhost:3001/api
# hoặc dev: npm run start:dev

# 3. Frontend (terminal 2)
cd frontend
cp .env.example .env.local
npm install
npm run build
npm start                 # chạy tại http://localhost:3000
```

## Tài khoản demo (đã seed)

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | admin@trungtam.vn | Admin123! |
| Giáo vụ | giaovu@trungtam.vn | Admin123! |
| Giáo viên | mai@trungtam.vn | Teacher123! |
| Giáo viên | hung@trungtam.vn | Teacher123! |
| Giáo viên | tuan@trungtam.vn | Teacher123! |
| Giáo viên | ha@trungtam.vn | Teacher123! |
| Giáo viên | bao@trungtam.vn | Teacher123! |

Dữ liệu seed: 6 khóa học (Tiếng Anh A1/A2, Tiếng Hàn, MOS, Python, Thiết kế),
6 lớp (ENG-A1-01, ENG-A2-01, KOR-01, MOS-01, PY-01, DESIGN-01), 4 phòng,
20 học viên (HV2026-001 → HV2026-020), 12 ghi danh, 12 hóa đơn
(4 PARTIAL đã thu 2.000.000đ, 2 PAID, 1 OVERDUE, còn lại UNPAID).

## Luồng demo 5 phút

1. Đăng nhập `admin@trungtam.vn / Admin123!` → Dashboard: 20 học viên,
   6 lớp đang chạy, doanh thu tháng 16.200.000đ, 1 hóa đơn quá hạn.
2. **Học viên:** tìm `HV2026-020` → thêm học viên mới bằng form.
3. **Lớp học:** mở lớp ENG-A1-01 → **Ghi danh** HV2026-020 → hệ thống tự tạo
   hóa đơn HD-0013 trị giá 3.500.000đ. Ghi danh lại cùng học viên/lớp →
   báo lỗi 400 "đã ghi danh".
4. **Thêm lịch trùng:** lớp ENG-A1-01, thứ 2, 18:30-19:30 → báo lỗi
   "Giáo viên đã có lịch 18:00-20:00".
5. **Học phí:** vào Học phí → chọn HD-0013 → thu 1.000.000đ bằng QR →
   còn nợ 2.500.000đ, trạng thái PARTIAL.
6. **Điểm danh:** vào lớp ENG-A1-01 → Điểm danh → chọn ngày, lưu →
   điểm danh lại cùng ngày chỉ cập nhật, không tạo trùng.
7. **Điểm:** nhập điểm FINAL 8.5 cho học viên; nhập 11 → báo lỗi 0-10.

## API chính (đều bắt đầu bằng `/api`, trừ login/refresh cần Bearer token)

| Method | Endpoint | Quyền |
| --- | --- | --- |
| POST | `/auth/login`, `/auth/refresh` | public |
| GET | `/auth/me` | đã đăng nhập |
| GET/POST | `/students`, `/students/import-csv` | ADMIN, ACADEMIC |
| GET/PUT/DELETE | `/students/:id` | ADMIN, ACADEMIC (xóa: ADMIN) |
| GET/POST/PUT/DELETE | `/teachers` | ADMIN, ACADEMIC |
| GET/POST/PUT/DELETE | `/courses`, `/rooms` | ADMIN, ACADEMIC |
| GET/POST/PUT | `/classes`, `/classes/:id` | ADMIN, ACADEMIC |
| POST | `/classes/:id/schedules` | ADMIN, ACADEMIC |
| GET | `/classes/schedule/week` | đã đăng nhập |
| GET/POST | `/enrollments` | ADMIN, ACADEMIC |
| GET/POST | `/attendance`, `/attendance/bulk` | ADMIN, ACADEMIC, TEACHER |
| GET/POST | `/grades` | ADMIN, ACADEMIC, TEACHER |
| GET | `/invoices` | đã đăng nhập |
| POST | `/invoices/:id/payments` | ADMIN, ACADEMIC |
| GET | `/dashboard/overview` | đã đăng nhập |
| GET/POST/PUT/DELETE | `/leads`, `/leads/:id` | ADMIN, ACADEMIC (xóa: ADMIN) |
| POST | `/leads/:id/convert` | ADMIN, ACADEMIC — tạo User + Student, lead → ENROLLED |
| GET/POST | `/certificates` | đã đăng nhập / ADMIN, ACADEMIC |
| GET | `/certificates/:id/pdf` | đã đăng nhập — tải PDF chứng chỉ |
| POST | `/certificates/:id/issue` | ADMIN, ACADEMIC |
| GET | `/notifications`, `/notifications/unread-count` | đã đăng nhập |
| PATCH | `/notifications/:id/read`, `/notifications/read-all` | đã đăng nhập (chỉ chủ sở hữu) |
| POST | `/uploads` (multipart `file`) | ADMIN, ACADEMIC, TEACHER — ảnh/PDF ≤5MB |
| GET | `/uploads/:filename` | công khai |
| GET | `/health` | công khai — `{status, db, redis, time}` |

## Ràng buộc nghiệp vụ đã cài

- 1 học viên không ghi danh trùng 1 lớp đang ACTIVE (kiểm tra ở service +
  unique DB `uq_enrollment_active`).
- Ghi danh kiểm tra sĩ số lớp (`maxStudents`), vượt → 400.
- Thêm lịch kiểm tra trùng giờ của giáo viên và của phòng, cùng thứ.
- Điểm phải 0-10, sai → 400.
- Điểm danh unique theo `(enrollmentId, sessionDate)` — điểm danh lại cùng
  ngày chỉ cập nhật (upsert).
- Thu tiền: không vượt số còn nợ; `amountDue = total - discount - đã thu`;
  trạng thái tự đổi UNPAID → PARTIAL → PAID; quá `dueDate` → OVERDUE
  (tự cập nhật khi gọi danh sách/dashboard).
- Hóa đơn tự tạo khi ghi danh, `invoiceCode` tăng dần HD-0001, HD-0002...

## Đã test (trên máy này, 25/11/2026)

- `npm install` backend (683 gói) và frontend (105 gói): pass.
- `npx prisma generate` + `prisma migrate dev --name init`: pass (xem lưu ý
  Prisma bên dưới).
- `npm run build` backend (Nest) và frontend (Next, 12 route): pass.
- `npm run seed`: pass — 20 HV, 5 GV, 6 lớp, 6 khóa, 12 ghi danh, 12 hóa đơn.
- Backend chạy thật tại :3001, frontend tại :3000 (login trả 200).
- API thật bằng curl: login đúng → 201 + token; sai mật khẩu → 401;
  không token → 401; dashboard: 20 HV, 6 lớp chạy, doanh thu 16.200.000đ,
  1 quá hạn; ghi danh → tạo HD-0013 3.500.000đ; ghi danh trùng → 400;
  lịch trùng giáo viên → 400; thu 1.000.000đ → còn nợ 2.500.000đ PARTIAL;
  điểm danh bulk 2 lần cùng ngày → count 1 (upsert); nhập điểm 8.5 → ok,
  điểm 11 → 400.
- Sau khi test, database đã được reset sạch (drop + migrate deploy + seed lại)
  và smoke test lại: dashboard 20 HV / 6 lớp / doanh thu 16.200.000đ / 1 quá hạn.


## Đã test Phase 2 (trên máy này, 25/11/2026)

- **Jest backend: 24/24 test pass** (`npm test` trong backend) — logic trùng lịch
  (kể cả kề nhau 18:00-20:00 vs 20:00-21:00 không trùng), tính học phí còn nợ
  và đổi trạng thái UNPAID/PARTIAL/PAID, điểm 0-10, key upsert điểm danh.
- **Build:** `npm run build` backend (Nest) và frontend (Next, 16 route, có
  `/leads`, `/certificates`, `/notifications`) đều pass.
- **Test luồng bằng curl (41/41 check pass, script `/tmp/test-phase2.sh`):**
  login đúng/sai (201/401), không token 401; dashboard 20 HV, 6 lớp chạy,
  doanh thu tháng 16.200.000đ, 1 quá hạn; lần 1 `cached:false`, lần 2
  `cached:true`, sau ghi danh/thu tiền thì `cached:false` (đã invalidate);
  lead mới → convert thành HV2026-021, convert lại 400; ghi danh tạo HD-0013
  3.500.000đ, ghi danh trùng 400, lịch trùng GV 400; thu 1.000.000đ QR còn nợ
  2.500.000đ PARTIAL, thu vượt 400; điểm danh bulk 2 lần cùng ngày chỉ tính
  1 lần và cập nhật LATE; điểm 8.5 ok, điểm 11 → 400; hoàn thành enrollment
  → cấp chứng chỉ CC-2026-0001, tải PDF 1.595 byte đúng `%PDF-` và
  `Content-Type: application/pdf` (đã sửa lỗi `pdfkit_1.default is not a
  constructor` bằng `import PDFDocument = require('pdfkit')` vì tsconfig
  không có `esModuleInterop`); cấp trùng trả về chứng chỉ cũ; upload ảnh
  trả `/api/uploads/<file>` và tải lại 200, upload .exe 400, upload không
  token 401; thông báo ghi danh tự tạo, `unread-count >= 1`, đánh dấu đã đọc;
  `/health` trả `db: up, redis: up`; frontend `/leads`, `/certificates`,
  `/notifications` đều HTTP 200.
- **Redis thật:** cài `redis-server 7.0.15` trên máy này, `redis-cli ping`
  → PONG; cache dashboard hoạt động thật (lần 2 `cached:true`).
- Sau test, DB đã reset sạch (drop + migrate deploy + seed lại): 20 HV,
  7 user, 12 hóa đơn, 0 notification/lead/certificate; file upload test đã xóa.
- **Lưu ý upload:** `UPLOAD_DIR='./backend/uploads'` là đường dẫn tương đối
  theo thư mục chạy backend. Chạy từ `backend/` thì file nằm ở
  `backend/backend/uploads/`; chạy bằng Docker (WORKDIR `/app`) thì nằm ở
  `/app/backend/uploads/`. URL trả về luôn là `/api/uploads/<file>` (đã sửa
  cho khớp global prefix `api`).

## Chưa làm / hạn chế (nói thật, đừng bịa là có)

- **Redis:** ĐÃ tích hợp ở Phase 2 (cache dashboard 60s + `/health`), đã test
  với Redis 7 thật trên máy này. Chưa có queue thông báo (chỉ tạo notification
  đồng bộ trong enroll/pay/overdue).
- **Docker:** `docker compose up` **vẫn chưa được test chạy thực tế** (máy này
  không có Docker). Đã kiểm tra: YAML hợp lệ (`yaml.safe_load`), cú pháp
  `entrypoint.sh` hợp lệ (`sh -n`), entrypoint tự migrate + seed-khi-trống,
  healthcheck backend gọi `/api/health`. Cần test lại trên máy có Docker.
  Dockerfile backend/frontend + compose đã viết sẵn, cần test lại trên máy có Docker.
- **Các bảng leads, certificates, notifications:** đã có trong Prisma schema
  nhưng chưa có API/UI riêng (chưa thuộc MVP).
- **Upload file / chứng chỉ PDF, thanh toán thật (VietQR/MoMo), Zalo OA:**
  chưa làm, theo đúng phạm vi MVP đã chốt.
- **shadcn/ui:** frontend dùng component tự viết theo phong cách shadcn
  (Card/Button/Input/Badge trong `src/components/ui.tsx`), chưa cài gói
  shadcn/ui đầy đủ qua CLI.
- **Test tự động (Jest/Playwright):** chưa viết test, mới test tay bằng curl.
- **Prisma engine trong môi trường này:** `npx prisma generate` lần đầu bị lỗi
  tải engine qua proxy (`ECONNRESET` ở `binaries.prisma.sh`). Đã khắc phục
  bằng cách tải engine bằng `curl` vào cache Prisma
  (`~/.cache/prisma/master/<hash>/debian-openssl-3.0.x/`, kèm file `.sha256`
  không có ký tự xuống dòng). Trên máy sinh viên có mạng bình thường thì
  `prisma generate` chạy thẳng, không cần bước này.
- **bcrypt → bcryptjs:** ban đầu dùng `bcrypt` (native) nhưng module native
  không build được khi `npm install --ignore-scripts`, nên đã đổi sang
  `bcryptjs` (thuần JS) ở auth, teachers và seed. API/hash không đổi.
- **Đường dẫn build backend:** `nest build` ra `dist/src/main.js`
  (không phải `dist/main.js`) nên `start:prod` đã sửa thành
  `node dist/src/main.js`.
- Frontend chưa có test e2e qua trình duyệt, chỉ kiểm tra HTTP 200 ở
  `/login` và `/dashboard`; các form gọi API thật qua `NEXT_PUBLIC_API_URL`.
