package config

import (
    "fmt"
    "log"
    "os"
    "github.com/joho/godotenv"
    "gorm.io/driver/mysql"
    "gorm.io/gorm"
    "purchasingsystem/models"
)

var DB *gorm.DB

func ConnectDatabase() {
    err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }

    dsn := fmt.Sprintf(
        "%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
        os.Getenv("DB_USER"),
        os.Getenv("DB_PASSWORD"),
        os.Getenv("DB_HOST"),
        os.Getenv("DB_PORT"),
        os.Getenv("DB_NAME"),
    )

    database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
    if err != nil {
        panic("Failed to connect to database: " + err.Error())
    }

    DB = database
    log.Println("MySQL database connected successfully")
}

func MigrateDatabase() {
    DB.AutoMigrate(
        &models.User{},
        &models.Supplier{},
        &models.Item{},
        &models.Purchasing{},
        &models.PurchasingDetail{},
    )
    log.Println("Database migrated successfully")
}