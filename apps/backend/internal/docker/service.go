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

	cmd := exec.CommandContext(ctx, LIST_ALL_CONTAINERS)

	output, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("Error listing containers: %v", err)
	}

	return string(output), nil
}

func (s *Service) ListRunningContainers() (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, LIST_RUNNING_CONTAINERS)

	output, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("Error listing running containers: %v", err)
	}

	return string(output), nil
}

func (s *Service) StopContainer(containerID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, STOP_CONTAINER, containerID)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("Error stopping container: %v", err)
	}

	return nil
}

func (s *Service) StartContainer(containerID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, START_CONTAINER, containerID)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("Error starting container: %v", err)
	}

	return nil
}

func (s *Service) RestartContainer(containerID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, RESTART_CONTAINER, containerID)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("Error restarting container: %v", err)
	}

	return nil
}

func (s *Service) RemoveContainer(containerID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, REMOVE_CONTAINER, containerID)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("Error removing container: %v", err)
	}

	return nil
}

func (s *Service) GetContainerLogs(containerID string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, GET_CONTAINER_LOGS, containerID)
	output, err := cmd.Output()

	if err != nil {
		return "", fmt.Errorf("Error getting container logs: %v", err)
	}

	return string(output), nil
}

func (s *Service) ExecInContainer(containerID string, command []string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	args := append([]string{EXEC_IN_CONTAINER, containerID}, command...)
	cmd := exec.CommandContext(ctx, "docker", args...)
	output, err := cmd.Output()

	if err != nil {
		return "", fmt.Errorf("Error executing command in container: %v", err)
	}

	return string(output), nil
}

func (s *Service) TopContainer(containerID string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, TOP_CONTAINER, containerID)
	output, err := cmd.Output()

	if err != nil {
		return "", fmt.Errorf("Error getting container processes: %v", err)
	}

	return string(output), nil
}

func (s *Service) InspectContainer(containerID string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, INSPECT_CONTAINER, containerID)
	output, err := cmd.Output()

	if err != nil {
		return "", fmt.Errorf("Error inspecting container: %v", err)
	}

	return string(output), nil
}

func (s *Service) ListAllImages() (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, LIST_ALL_IMAGES)

	output, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("Error listing images: %v", err)
	}

	return string(output), nil
}

func (s *Service) DeleteImage(imageID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, DELETE_IMAGE, imageID)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("Error deleting image: %v", err)
	}

	return nil
}

func (s *Service) InspectImage(imageID string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, INSPECT_IMAGE, imageID)
	output, err := cmd.Output()

	if err != nil {
		return "", fmt.Errorf("Error inspecting image: %v", err)
	}

	return string(output), nil
}

func (s *Service) BuildImage(dockerfilePath string, imageName string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	cmd := exec.CommandContext(ctx, BUILD_IMAGE, "-t", imageName, "-f", dockerfilePath, ".")
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("Error building image: %v", err)
	}

	return nil
}

func (s *Service) PullImage(imageName string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	cmd := exec.CommandContext(ctx, PULL_IMAGE, imageName)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("Error pulling image: %v", err)
	}

	return nil
}

func (s *Service) PushImage(imageName string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	cmd := exec.CommandContext(ctx, PUSH_IMAGE, imageName)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("Error pushing image: %v", err)
	}

	return nil
}

func (s *Service) ListNetworks() (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, LIST_NETWORKS)
	output, err := cmd.Output()

	if err != nil {
		return "", fmt.Errorf("Error listing networks: %v", err)
	}

	return string(output), nil
}

func (s *Service) InspectNetwork(networkID string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, INSPECT_NETWORK, networkID)
	output, err := cmd.Output()

	if err != nil {
		return "", fmt.Errorf("Error inspecting network: %v", err)
	}

	return string(output), nil
}

func (s *Service) ListVolumes() (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, LIST_VOLUMES)
	output, err := cmd.Output()

	if err != nil {
		return "", fmt.Errorf("Error listing volumes: %v", err)
	}

	return string(output), nil
}

func (s *Service) InspectVolume(volumeID string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, INSPECT_VOLUME, volumeID)
	output, err := cmd.Output()

	if err != nil {
		return "", fmt.Errorf("Error inspecting volume: %v", err)
	}

	return string(output), nil
}

func (s *Service) DockerInfo() (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, DOCKER_INFO)
	output, err := cmd.Output()

	if err != nil {
		return "", fmt.Errorf("Error getting Docker info: %v", err)
	}

	return string(output), nil
}

func (s *Service) DockerVersion() (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, DOCKER_VERSION)
	output, err := cmd.Output()

	if err != nil {
		return "", fmt.Errorf("Error getting Docker version: %v", err)
	}

	return string(output), nil
}

func (s *Service) SystemDF() (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, SYSTEM_DF)
	output, err := cmd.Output()

	if err != nil {
		return "", fmt.Errorf("Error getting system disk usage: %v", err)
	}

	return string(output), nil
}

func (s *Service) DockerEvents() (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, DOCKER_EVENTS)
	output, err := cmd.Output()

	if err != nil {
		return "", fmt.Errorf("Error getting Docker events: %v", err)
	}

	return string(output), nil
}

func (s *Service) PruneContainers() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, PRUNE_CONTAINERS)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("Error pruning containers: %v", err)
	}

	return nil
}

func (s *Service) PruneImages() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, PRUNE_IMAGES)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("Error pruning images: %v", err)
	}

	return nil
}

func (s *Service) PruneVolumes() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, PRUNE_VOLUMES)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("Error pruning volumes: %v", err)
	}

	return nil
}

func (s *Service) PruneSystem() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, PRUNE_SYSTEM)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("Error pruning system: %v", err)
	}

	return nil
}

func (s *Service) RunContainer(imageName string, args []string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmdArgs := append([]string{RUN_CONTAINER}, args...)
	cmd := exec.CommandContext(ctx, "docker", cmdArgs...)

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("Error running container: %v", err)
	}

	return nil
}
