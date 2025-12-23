package middleware

import (
    "github.com/gofiber/fiber/v2"
    "github.com/golang-jwt/jwt/v4"
    "os"
    "strings"
)

func AuthMiddleware(c *fiber.Ctx) error {
    authHeader := c.Get("Authorization")
    if authHeader == "" {
        return c.Status(401).JSON(fiber.Map{"error": "Missing authorization header"})
    }

    parts := strings.Split(authHeader, " ")
    if len(parts) != 2 || parts[0] != "Bearer" {
        return c.Status(401).JSON(fiber.Map{"error": "Invalid authorization format"})
    }

    tokenString := parts[1]

    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fiber.NewError(401, "Invalid signing method")
        }
        return []byte(os.Getenv("JWT_SECRET")), nil
    })

    if err != nil {
        return c.Status(401).JSON(fiber.Map{"error": "Invalid token"})
    }

    if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
        c.Locals("user", token)
        c.Locals("user_id", claims["user_id"])
        c.Locals("username", claims["username"])
        c.Locals("role", claims["role"])
        return c.Next()
    }

    return c.Status(401).JSON(fiber.Map{"error": "Invalid token"})
}