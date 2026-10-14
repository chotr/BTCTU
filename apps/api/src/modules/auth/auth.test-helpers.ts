import { randomUUID } from "node:crypto";
import type { Session, User } from "@/db/schema";
import type { SessionStore, UserStore } from "./auth.types";
import { PasswordService } from "./password.service";
import type { CreateSessionInput } from "./types";

export type InMemoryStores = {
  users: User[];
  sessions: Session[];
  userStore: UserStore;
  sessionStore: SessionStore;
};

export function createInMemoryStores(
  initial: { users?: User[]; sessions?: Session[] } = {},
): InMemoryStores {
  const users = [...(initial.users ?? [])];
  const sessions = [...(initial.sessions ?? [])];

  const userStore: UserStore = {
    async findByEmail(email: string) {
      const normalized = email.trim().toLowerCase();
      return users.find((row) => row.email === normalized) ?? null;
    },
    async findById(id: string) {
      return users.find((row) => row.id === id) ?? null;
    },
  };

  const sessionStore: SessionStore = {
    async create(data: CreateSessionInput) {
      const session: Session = {
        id: randomUUID(),
        userId: data.userId,
        refreshTokenHash: data.refreshTokenHash,
        expiresAt: data.expiresAt,
        revokedAt: null,
        createdAt: new Date(),
        lastUsedAt: new Date(),
      };
      sessions.push(session);
      return session;
    },
    async findByRefreshTokenHash(refreshTokenHash: string) {
      return (
        sessions.find((row) => row.refreshTokenHash === refreshTokenHash) ?? null
      );
    },
    async revoke(sessionId: string) {
      const session = sessions.find(
        (row) => row.id === sessionId && row.revokedAt === null,
      );
      if (!session) return null;

      session.revokedAt = new Date();
      return session;
    },
    async revokeAllForUser(userId: string) {
      for (const session of sessions) {
        if (session.userId === userId && session.revokedAt === null) {
          session.revokedAt = new Date();
        }
      }
    },
  };

  return { users, sessions, userStore, sessionStore };
}

export async function createTestUser(
  stores: InMemoryStores,
  input: { email: string; password: string; status?: User["status"] },
): Promise<User> {
  const user: User = {
    id: randomUUID(),
    email: input.email.trim().toLowerCase(),
    passwordHash: await new PasswordService().hash(input.password),
    status: input.status ?? "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  stores.users.push(user);

  return user;
}
