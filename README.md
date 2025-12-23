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

### **Step 2: Jalankan Backend**

```sql
# Buka Terminal/CMD di folder backend
cd backend

# Install dependencies Go
go mod tidy

# Sesuaikan konfigurasi database di file .env
# Untuk XAMPP, biarkan password kosong:
# DB_PASSWORD=

# Jalankan server
go run main.go

# Jika berhasil, muncul:
# MySQL database connected successfully
# Fiber server running on port 8080
```

### **Step 3: Jalankan Frontend**

```sql
# Buka Terminal/CMD baru di folder frontend
cd frontend

# Pilih salah satu cara:
# 1. Dengan Python (paling mudah)
python -m http.server 3000

# 2. Dengan Node.js (jika ada)
npx http-server -p 3000

# 3. Dengan VS Code Live Server
#    Buka folder frontend di VS Code, klik kanan index.html -> "Open with Live Server"
```

## **Cara Menggunakan Aplikasi**

1. **Login ke Sistem**

   - Buka http://localhost:3000
   - Masukkan username admin dan password admin123
   - Klik tombol Login

2. **Tambah Data Barang**

   - Klik menu "Items" di navbar
   - Klik tombol "Add New Item"
   - Isi form: Nama Barang, Stok Awal, Harga
   - Klik "Save Item"

3. **Tambah Data Supplier**

   - Klik menu "Suppliers" di navbar
   - Klik tombol "Add New Supplier"
   - Isi form: Nama Supplier, Email, Alamat
   - Klik "Save Supplier"

4. **Buat Purchase Order**
   - Klik menu "Create Purchase"
   - Pilih supplier dari dropdown
   - Pilih barang dan masukkan jumlah
   - Klik "Add to Cart" untuk tambah ke keranjang
   - Klik "Submit Purchase Order" untuk simpan

5. **Monitoring Dashboard**
   - Lihat statistik di dashboard utama
   - Cek "Low Stock Items" untuk barang hampir habis
   - Lihat "Recent Purchases" untuk aktivitas terbaru
