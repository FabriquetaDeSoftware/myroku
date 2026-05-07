package docker

const (
	// Containers
	LIST_ALL_CONTAINERS     = "ps -a --format \"{{.ID}}\\t{{.Names}}\\t{{.Status}}\\t{{.Image}}\\t{{.Ports}}\""
	LIST_RUNNING_CONTAINERS = "stats --no-stream --format \"{{.ID}}\\t{{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}\\t{{.MemPerc}}\""
	STOP_CONTAINER          = "stop"
	START_CONTAINER         = "start"
	RESTART_CONTAINER       = "restart"
	REMOVE_CONTAINER        = "rm"
	GET_CONTAINER_LOGS      = "logs"
	EXEC_IN_CONTAINER       = "exec"
	TOP_CONTAINER           = "top"
	INSPECT_CONTAINER       = "inspect"

	// Imagens
	LIST_ALL_IMAGES = "image ls --format \"{{.Repository}}\\t{{.Tag}}\\t{{.ID}}\\t{{.Size}}\""
	DELETE_IMAGE    = "image rm"
	INSPECT_IMAGE   = "image inspect"
	BUILD_IMAGE     = "build"
	PULL_IMAGE      = "pull"
	PUSH_IMAGE      = "push"

	// Redes
	LIST_NETWORKS   = "network ls"
	INSPECT_NETWORK = "network inspect"

	// Volumes
	LIST_VOLUMES   = "volume ls"
	INSPECT_VOLUME = "volume inspect"

	// Sistema
	DOCKER_INFO    = "info"
	DOCKER_VERSION = "version"
	SYSTEM_DF      = "system df"
	DOCKER_EVENTS  = "events"

	// Limpeza
	PRUNE_CONTAINERS = "container prune"
	PRUNE_IMAGES     = "image prune"
	PRUNE_VOLUMES    = "volume prune"
	PRUNE_SYSTEM     = "system prune"

	// Execução
	RUN_CONTAINER = "run"
)
