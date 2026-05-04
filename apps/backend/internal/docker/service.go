package docker

import (
	"context"
	"fmt"
	"os/exec"
	"time"
)

type Service struct{}

func NewService() *Service {
	return &Service{}
}

func (s *Service) ListAllContainers() (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "docker", "ps", "-a", "--format", "{{.Names}}")

	output, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("Error listing containers: %v", err)
	}

	return string(output), nil
}
