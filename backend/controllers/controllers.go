package controllers

import (
    "github.com/gofiber/fiber/v2"
    "github.com/golang-jwt/jwt/v4"
    "golang.org/x/crypto/bcrypt"
    "purchasingsystem/config"
    "purchasingsystem/models"
    "time"
    "strconv"
    "os"
)

func HashPassword(password string) ([]byte, error) {
    return bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
}

func CheckPasswordHash(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}

func Register(c *fiber.Ctx) error {
    var user models.User
    if err := c.BodyParser(&user); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": err.Error()})
    }

    hashedPassword, err := HashPassword(user.Password)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Could not hash password"})
    }

    user.Password = string(hashedPassword)
    
    if err := config.DB.Create(&user).Error; err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }

    return c.Status(201).JSON(user)
}

func Login(c *fiber.Ctx) error {
    var input struct {
        Username string `json:"username"`
        Password string `json:"password"`
    }

    if err := c.BodyParser(&input); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": err.Error()})
    }

    var user models.User
    if err := config.DB.Where("username = ?", input.Username).First(&user).Error; err != nil {
        return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
    }

    if !CheckPasswordHash(input.Password, user.Password) {
        return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
    }

    token := jwt.New(jwt.SigningMethodHS256)
    claims := token.Claims.(jwt.MapClaims)
    claims["user_id"] = user.ID
    claims["username"] = user.Username
    claims["role"] = user.Role
    claims["exp"] = time.Now().Add(time.Hour * 72).Unix()

    t, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Could not create token"})
    }

    return c.JSON(fiber.Map{
        "token": t,
        "user": fiber.Map{
            "id":       user.ID,
            "username": user.Username,
            "role":     user.Role,
        },
    })
}

func GetSuppliers(c *fiber.Ctx) error {
    var suppliers []models.Supplier
    config.DB.Find(&suppliers)
    return c.JSON(suppliers)
}

func GetSupplier(c *fiber.Ctx) error {
    id, _ := strconv.Atoi(c.Params("id"))
    var supplier models.Supplier
    
    if err := config.DB.First(&supplier, id).Error; err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "Supplier not found"})
    }
    
    return c.JSON(supplier)
}

func CreateSupplier(c *fiber.Ctx) error {
    var supplier models.Supplier
    if err := c.BodyParser(&supplier); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": err.Error()})
    }
    
    if err := config.DB.Create(&supplier).Error; err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    
    return c.Status(201).JSON(supplier)
}

func UpdateSupplier(c *fiber.Ctx) error {
    id, _ := strconv.Atoi(c.Params("id"))
    var supplier models.Supplier
    
    if err := config.DB.First(&supplier, id).Error; err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "Supplier not found"})
    }
    
    var input models.Supplier
    if err := c.BodyParser(&input); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": err.Error()})
    }
    
    supplier.Name = input.Name
    supplier.Email = input.Email
    supplier.Address = input.Address
    
    config.DB.Save(&supplier)
    return c.JSON(supplier)
}

func DeleteSupplier(c *fiber.Ctx) error {
    id, _ := strconv.Atoi(c.Params("id"))
    var supplier models.Supplier
    
    if err := config.DB.First(&supplier, id).Error; err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "Supplier not found"})
    }
    
    config.DB.Delete(&supplier)
    return c.JSON(fiber.Map{"message": "Supplier deleted"})
}

func GetItems(c *fiber.Ctx) error {
    var items []models.Item
    config.DB.Find(&items)
    return c.JSON(items)
}

func GetItem(c *fiber.Ctx) error {
    id, _ := strconv.Atoi(c.Params("id"))
    var item models.Item
    
    if err := config.DB.First(&item, id).Error; err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "Item not found"})
    }
    
    return c.JSON(item)
}

func CreateItem(c *fiber.Ctx) error {
    var item models.Item
    if err := c.BodyParser(&item); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": err.Error()})
    }
    
    if err := config.DB.Create(&item).Error; err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    
    return c.Status(201).JSON(item)
}

func UpdateItem(c *fiber.Ctx) error {
    id, _ := strconv.Atoi(c.Params("id"))
    var item models.Item
    
    if err := config.DB.First(&item, id).Error; err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "Item not found"})
    }
    
    var input models.Item
    if err := c.BodyParser(&input); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": err.Error()})
    }
    
    item.Name = input.Name
    item.Stock = input.Stock
    item.Price = input.Price
    
    config.DB.Save(&item)
    return c.JSON(item)
}

func DeleteItem(c *fiber.Ctx) error {
    id, _ := strconv.Atoi(c.Params("id"))
    var item models.Item
    
    if err := config.DB.First(&item, id).Error; err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "Item not found"})
    }
    
    config.DB.Delete(&item)
    return c.JSON(fiber.Map{"message": "Item deleted"})
}

func GetPurchasings(c *fiber.Ctx) error {
    var purchasings []models.Purchasing
    config.DB.Preload("Supplier").Preload("User").Preload("Details.Item").Find(&purchasings)
    return c.JSON(purchasings)
}

func GetPurchasing(c *fiber.Ctx) error {
    id, _ := strconv.Atoi(c.Params("id"))
    var purchasing models.Purchasing
    
    if err := config.DB.Preload("Supplier").Preload("User").Preload("Details.Item").First(&purchasing, id).Error; err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "Purchasing not found"})
    }
    
    return c.JSON(purchasing)
}

func CreatePurchasing(c *fiber.Ctx) error {
    var input struct {
        SupplierID uint `json:"supplier_id"`
        Details    []struct {
            ItemID uint `json:"item_id"`
            Qty    int  `json:"qty"`
        } `json:"details"`
    }

    if err := c.BodyParser(&input); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": err.Error()})
    }

    user := c.Locals("user").(*jwt.Token)
    claims := user.Claims.(jwt.MapClaims)
    userID := uint(claims["user_id"].(float64))

    tx := config.DB.Begin()

    var grandTotal float64
    var purchasingDetails []models.PurchasingDetail

    for _, detail := range input.Details {
        var item models.Item
        if err := tx.First(&item, detail.ItemID).Error; err != nil {
            tx.Rollback()
            return c.Status(404).JSON(fiber.Map{"error": "Item not found"})
        }

        subTotal := item.Price * float64(detail.Qty)
        grandTotal += subTotal

        purchasingDetails = append(purchasingDetails, models.PurchasingDetail{
            ItemID:   detail.ItemID,
            Qty:      detail.Qty,
            SubTotal: subTotal,
        })

        item.Stock += detail.Qty
        if err := tx.Save(&item).Error; err != nil {
            tx.Rollback()
            return c.Status(500).JSON(fiber.Map{"error": "Failed to update item stock"})
        }
    }

    purchasing := models.Purchasing{
        Date:       time.Now(),
        SupplierID: input.SupplierID,
        UserID:     userID,
        GrandTotal: grandTotal,
        Details:    purchasingDetails,
    }

    if err := tx.Create(&purchasing).Error; err != nil {
        tx.Rollback()
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }

    tx.Commit()
    
    config.DB.Preload("Supplier").Preload("User").Preload("Details.Item").First(&purchasing, purchasing.ID)
    
    return c.Status(201).JSON(purchasing)
}
func GetUsers(c *fiber.Ctx) error {
    var users []models.User
    config.DB.Find(&users)
    return c.JSON(users)
}

func GetUser(c *fiber.Ctx) error {
    id, _ := strconv.Atoi(c.Params("id"))
    var user models.User
    
    if err := config.DB.First(&user, id).Error; err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "User not found"})
    }
    
    return c.JSON(user)
}

func UpdateUser(c *fiber.Ctx) error {
    id, _ := strconv.Atoi(c.Params("id"))
    var user models.User
    
    if err := config.DB.First(&user, id).Error; err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "User not found"})
    }
    
    var input models.User
    if err := c.BodyParser(&input); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": err.Error()})
    }
    
    user.Username = input.Username
    user.Role = input.Role
    
    if input.Password != "" {
        hashedPassword, err := HashPassword(input.Password)
        if err != nil {
            return c.Status(500).JSON(fiber.Map{"error": "Could not hash password"})
        }
        user.Password = string(hashedPassword)
    }
    
    config.DB.Save(&user)
    return c.JSON(user)
}

func DeleteUser(c *fiber.Ctx) error {
    id, _ := strconv.Atoi(c.Params("id"))
    var user models.User
    
    if err := config.DB.First(&user, id).Error; err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "User not found"})
    }
    
    config.DB.Delete(&user)
    return c.JSON(fiber.Map{"message": "User deleted"})
}
