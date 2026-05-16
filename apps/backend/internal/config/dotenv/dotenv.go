package dotenv

import (
	"log"
	"os"
	"strings"
)

type config struct {
	Port        string
	DatabaseURL string
}

var Env config

func Load(path string) error {
	data, err := os.ReadFile(path)
	if err != nil && !os.IsNotExist(err) {
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

	parse()
	return nil
}

func parse() {
	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("PORT undefined in environment variables")
	}

	// databaseUrl := os.Getenv("DATABASE_URL")
	// if databaseUrl == "" {
	// 	log.Fatal("DATABASE_URL undefined in environment variables")
	// }

	Env = config{
		Port: port,
		// DatabaseURL: databaseUrl,
	}
}
