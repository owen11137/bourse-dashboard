# بورس‌نما — bourse-dashboard

صفحه index قیمت جهانی فلزات، با React و Material UI راست‌چین و API آزمایشی Spring Boot 4.1.1.

## اجرای محلی

نیازمندی‌ها: Java 17 یا بالاتر، Maven 3.6.3 یا بالاتر، Node.js 22.12 یا بالاتر.

ترمینال اول:
```bash
cd backend
mvn spring-boot:run
```
ترمینال دوم:
```bash
cd frontend
npm ci
npm run dev
```
صفحه: http://localhost:5173 — مسیر `/` همان صفحه index است.
Vite درخواست‌های `/api` را به بک‌اند روی پورت 8080 هدایت می‌کند.

## API

`GET http://localhost:8080/api/v1/metals/prices`

خروجی: `source`, `demo`, `updatedAt`, `metals`؛ هر فلز دارای `symbol`, `name`, `category`, `price`, `currency`, `unit`, `changePercent` است.
قیمت فلزات گران‌بها به دلار بر اونس تروا و صنعتی به دلار بر تن متریک است.
تمام اعداد ثابت و ساختگی‌اند؛ timestamp زمان fixture است، نه زمان زنده بازار. دکمه به‌روزرسانی فقط دوباره API را می‌خواند.
برای داده واقعی، پیاده‌سازی `MetalPriceService` را جایگزین کنید.

## بررسی
```bash
cd backend
mvn test
```
```bash
cd frontend
npm run build
```

## انتشار

این تغییر، کد را در GitHub ثبت می‌کند و سایت عمومی منتشر نمی‌کند.
برای میزبانی، خروجی `frontend/dist` باید ارائه شود و مسیر `/api` به بک‌اند هدایت شود؛ `vite preview` برای توسعه است.
