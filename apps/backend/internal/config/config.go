package config

import (
	"fmt"
	"os"
	"strings"
)

type Config struct {
	Port        string
	DatabaseURL string
	OpenAPIPath string
}

func Load(envPath string) (*Config, error) {
	if err := loadEnvFile(envPath); err != nil {
		return nil, err
	}

	port := os.Getenv("PORT")
	if port == "" {
		return nil, fmt.Errorf("PORT undefined in environment variables")
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL undefined in environment variables")
	}

	openAPIPath := os.Getenv("OPENAPI_PATH")
	if openAPIPath == "" {
		openAPIPath = "api/swagger.json"
	}

	return &Config{
		Port:        port,
		DatabaseURL: databaseURL,
		OpenAPIPath: openAPIPath,
	}, nil
}

func loadEnvFile(path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}

	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		key, val, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}

		key = strings.TrimSpace(key)
		val = strings.Trim(strings.TrimSpace(val), `"'`)
		if _, exists := os.LookupEnv(key); !exists {
			os.Setenv(key, val)
		}
	}

	return nil
}
