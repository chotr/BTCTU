import type { AppState } from "@/lib/store";

/** Nguồn chân lý duy nhất cho việc tra cứu hiển thị nhân sự/đơn vị. */

export const personName = (state: AppState, id: string): string | undefined =>
  state.people.find((p) => p.id === id)?.name;

export const departmentName = (
  state: AppState,
  id: string,
): string | undefined => state.departments.find((d) => d.id === id)?.name;

/** Phân giải đối tượng đánh giá (cá nhân hoặc tập thể) thành tên hiển thị. */
export const nameOf = (state: AppState, id: string): string | undefined =>
  personName(state, id) ?? departmentName(state, id);
