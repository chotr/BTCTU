import type { Actor, Person } from "@/types";

export type DirectoryPerson = Pick<
  Person,
  "id" | "name" | "role" | "departmentId"
>;

export type ActorResolver = {
  resolve(userId: string): Promise<Actor | null>;
};

export class MockActorResolver implements ActorResolver {
  constructor(private readonly people: DirectoryPerson[]) {}

  async resolve(userId: string): Promise<Actor | null> {
    const person = this.people.find((candidate) => candidate.id === userId);
    if (!person) return null;

    return {
      id: person.id,
      name: person.name,
      role: person.role,
      departmentId: person.departmentId,
    };
  }
}

export class UnprovisionedActorResolver implements ActorResolver {
  async resolve(): Promise<Actor | null> {
    return null;
  }
}
