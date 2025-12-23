package main

import (
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "github.com/gofiber/fiber/v2/middleware/logger"
    "purchasingsystem/config"
    "purchasingsystem/controllers"
    "purchasingsystem/middleware"
    "purchasingsystem/models"

)

func main() {
    config.ConnectDatabase()
    config.DB.AutoMigrate(
        &models.User{},
        &models.Supplier{},
        &models.Item{},
        &models.Purchasing{},
        &models.PurchasingDetail{},
    )

    hashedPassword, _ := controllers.HashPassword("admin123")
    adminUser := models.User{
        Username: "admin",
        Password: string(hashedPassword),
        Role:     "admin",
    }
    config.DB.FirstOrCreate(&adminUser, models.User{Username: "admin"})

    app := fiber.New()

    app.Use(cors.New(cors.Config{
        AllowOrigins:     "http://localhost:3000, http://127.0.0.1:3000",
        AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
        AllowMethods:     "GET, POST, PUT, DELETE",
        AllowCredentials: true,
    }))
    app.Use(logger.New())

    app.Post("/api/register", controllers.Register)
    app.Post("/api/login", controllers.Login)

    api := app.Group("/api", middleware.AuthMiddleware)

    api.Get("/users", controllers.GetUsers)
    api.Get("/users/:id", controllers.GetUser)
    api.Put("/users/:id", controllers.UpdateUser)
    api.Delete("/users/:id", controllers.DeleteUser)

    api.Get("/suppliers", controllers.GetSuppliers)
    api.Get("/suppliers/:id", controllers.GetSupplier)
    api.Post("/suppliers", controllers.CreateSupplier)
    api.Put("/suppliers/:id", controllers.UpdateSupplier)
    api.Delete("/suppliers/:id", controllers.DeleteSupplier)

    api.Get("/items", controllers.GetItems)
    api.Get("/items/:id", controllers.GetItem)
    api.Post("/items", controllers.CreateItem)
    api.Put("/items/:id", controllers.UpdateItem)
    api.Delete("/items/:id", controllers.DeleteItem)

    api.Get("/purchasings", controllers.GetPurchasings)
    api.Get("/purchasings/:id", controllers.GetPurchasing)
    api.Post("/purchasings", controllers.CreatePurchasing)

    app.Listen(":8080")
}
