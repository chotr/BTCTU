import type { Actor, Person } from "@/types";

export type DirectoryPerson = Pick<
  Person,
  "id" | "name" | "role" | "departmentId"
>;

export type ActorResolver = (
  userId: string,
) => Promise<Actor | null> | Actor | null;

export function createDirectoryActorResolver(
  people: DirectoryPerson[],
): ActorResolver {
  return (userId: string) => {
    const person = people.find((p) => p.id === userId);
    if (!person) return null;
    return {
      id: person.id,
      name: person.name,
      role: person.role,
      departmentId: person.departmentId,
    };
  };
}
