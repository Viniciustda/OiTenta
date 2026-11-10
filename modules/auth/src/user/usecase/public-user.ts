import { User } from "../model";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
}

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, name: user.name, email: user.email };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
