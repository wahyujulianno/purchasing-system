# Purchasing System

Aplikasi sistem pembelian barang dengan backend Go Fiber dan frontend jQuery.

### **Backend:**

- Go Fiber (Framework)
- GORM (ORM)
- MySQL Database
- JWT Authentication

### **Frontend:**

- jQuery (DOM Manipulation & AJAX)
- Bootstrap 5 (Styling)
- Vanilla JavaScript

## **Fitur Utama**

1. **Authentication System**

   - Login/Register dengan JWT
   - Protected routes dengan middleware

2. **Master Data Management**

   - CRUD Items (Barang)
   - CRUD Suppliers (Pemasok)

3. **Purchasing Transactions**

   - Buat purchase order
   - Keranjang belanja sementara
   - Kalkulasi otomatis subtotal & grand total
   - Update stok otomatis

4. **Dashboard**
   - Statistik items, suppliers, purchases
   - Low stock alerts
   - Recent purchases history

## **Instalasi & Setup**

### **Prerequisites:**

1. Go 1.21+ (untuk backend)
2. MySQL (via XAMPP/WAMP)
3. Web browser modern

### **Step 1: Setup Database**

```sql
-- Login ke MySQL
mysql -u root

-- Buat database
CREATE DATABASE purchasing_db;

-- Gunakan database
USE purchasing_db;
```
