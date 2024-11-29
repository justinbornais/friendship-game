package main

import (
	"log"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/filesystem"
	"github.com/gofiber/websocket/v2"
)

func main() {
	app := fiber.New()

	// Serve static files.
	app.Static("/static", "./static")

	// Serve index.html.
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendFile("./views/index.html")
	})

	app.Use("/", filesystem.New(filesystem.Config{
		Root:   http.Dir("./views"),
		Browse: true, // Allow directory browsing (optional)
		Index:  "index.html",
	}))

	// WebSocket endpoint.
	app.Get("/ws/:game_code", websocket.New(func(c *websocket.Conn) {
		log.Println(c)
	}))

	// Host server.
	log.Fatal(app.Listen(":8080"))
}
