import { USERS } from "./mock";
import { ROLES, type AppUser, type Department, type Person } from "./types";

type IdentityState = {
  people: Person[];
  departments: Department[];
};

export function resolveAppUser(
  state: IdentityState,
  userId: string | null | undefined,
): AppUser | null {
  if (!userId) return null;
  const person = state.people.find((row) => row.id === userId);
  const preset = USERS.find((row) => row.id === userId);
  if (!person && !preset) return null;
  const departmentId = person?.departmentId ?? preset?.departmentId ?? null;
  const department = departmentId
    ? state.departments.find((row) => row.id === departmentId)
    : undefined;
  const derivedRole =
    person && department?.headId === person.id
      ? ROLES.truongPhong
      : ROLES.congChuc;
  return {
    id: userId,
    name: person?.name ?? preset?.name ?? userId,
    title: person?.title ?? preset?.title ?? "",
    role: preset?.role ?? derivedRole,
    departmentId,
    departmentName: department?.name ?? preset?.departmentName ?? null,
  };
}

export function demoAccounts(): AppUser[] {
  return USERS;
}
