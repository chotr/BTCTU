import type { AppState } from "@/lib/store";

/** Single source of truth for person/department display lookups. */

export const personName = (state: AppState, id: string): string | undefined =>
  state.people.find((p) => p.id === id)?.name;

export const departmentName = (
  state: AppState,
  id: string,
): string | undefined => state.departments.find((d) => d.id === id)?.name;

/** Resolve an evaluation subject (person or collective) to a display name. */
export const nameOf = (state: AppState, id: string): string | undefined =>
  personName(state, id) ?? departmentName(state, id);
