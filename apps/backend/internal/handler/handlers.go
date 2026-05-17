package handler

type Handlers struct {
	User *UserHandler
	Docs *DocsHandler
}

func NewHandlers(svc UserService, openAPIPath string) *Handlers {
	return &Handlers{
		User: NewUser(svc),
		Docs: NewDocs(openAPIPath),
	}
}
