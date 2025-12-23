package models

import (
    "time"
)

type User struct {
    ID        uint      `json:"id" gorm:"primaryKey"`
    Username  string    `json:"username" gorm:"unique;not null"`
    Password  string    `json:"-" gorm:"not null"`
    Role      string    `json:"role" gorm:"default:'user'"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

type Supplier struct {
    ID        uint      `json:"id" gorm:"primaryKey"`
    Name      string    `json:"name" gorm:"not null"`
    Email     string    `json:"email"`
    Address   string    `json:"address"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

type Item struct {
    ID        uint      `json:"id" gorm:"primaryKey"`
    Name      string    `json:"name" gorm:"not null"`
    Stock     int       `json:"stock" gorm:"default:0"`
    Price     float64   `json:"price" gorm:"not null"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

type Purchasing struct {
    ID         uint              `json:"id" gorm:"primaryKey"`
    Date       time.Time         `json:"date"`
    SupplierID uint              `json:"supplier_id"`
    UserID     uint              `json:"user_id"`
    GrandTotal float64           `json:"grand_total"`
    CreatedAt  time.Time         `json:"created_at"`
    UpdatedAt  time.Time         `json:"updated_at"`
    Supplier   Supplier          `json:"supplier" gorm:"foreignKey:SupplierID"`
    User       User              `json:"user" gorm:"foreignKey:UserID"`
    Details    []PurchasingDetail `json:"details" gorm:"foreignKey:PurchasingID"`
}

type PurchasingDetail struct {
    ID           uint    `json:"id" gorm:"primaryKey"`
    PurchasingID uint    `json:"purchasing_id"`
    ItemID       uint    `json:"item_id"`
    Qty          int     `json:"qty" gorm:"not null"`
    SubTotal     float64 `json:"sub_total"`
    CreatedAt    time.Time `json:"created_at"`
    UpdatedAt    time.Time `json:"updated_at"`
    Item         Item    `json:"item" gorm:"foreignKey:ItemID"`
}