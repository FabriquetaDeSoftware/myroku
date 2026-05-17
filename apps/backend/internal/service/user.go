package service

import (
	"context"

	"github.com/FabriquetaDeSoftware/myroku/internal/db"
)

type UserService struct {
	q db.Querier
}

func NewUser(q db.Querier) *UserService {
	return &UserService{q: q}
}

func (s *UserService) GetByEmail(ctx context.Context, email string) (db.User, error) {
	return s.q.GetUserByEmail(ctx, email)
}
