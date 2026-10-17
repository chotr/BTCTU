import { apiRequest } from "./http-client";

export type ManagedAccount = {
  id: string;
  email: string;
  status: "ACTIVE" | "DISABLED";
  accountRole: "USER" | "ACCOUNT_ADMIN" | "ROOT";
  mustChangePassword: boolean;
  directoryActorId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AccountCandidate = {
  id: string;
  name: string;
  title: string;
};

export async function listManagedAccounts(): Promise<ManagedAccount[]> {
  return (await apiRequest<ManagedAccount[]>("/api/v1/admin/users")).data;
}

export async function listAccountCandidates(): Promise<AccountCandidate[]> {
  return (await apiRequest<AccountCandidate[]>("/api/v1/admin/user-candidates")).data;
}

export async function createManagedAccount(input: {
  email: string;
  directoryActorId: string;
  initialPassword: string;
}): Promise<ManagedAccount> {
  return (
    await apiRequest<ManagedAccount>("/api/v1/admin/users", {
      method: "POST",
      body: JSON.stringify(input),
    })
  ).data;
}

export async function updateManagedAccount(
  id: string,
  input: { status: "ACTIVE" | "DISABLED" },
): Promise<ManagedAccount> {
  return (
    await apiRequest<ManagedAccount>(`/api/v1/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    })
  ).data;
}

export async function resetManagedPassword(
  id: string,
  temporaryPassword: string,
): Promise<ManagedAccount> {
  return (
    await apiRequest<ManagedAccount>(`/api/v1/admin/users/${id}/reset-password`, {
      method: "POST",
      body: JSON.stringify({ temporaryPassword }),
    })
  ).data;
}

export async function updateManagedRole(
  id: string,
  accountRole: "USER" | "ACCOUNT_ADMIN",
): Promise<ManagedAccount> {
  return (
    await apiRequest<ManagedAccount>(`/api/v1/admin/users/${id}/account-role`, {
      method: "PUT",
      body: JSON.stringify({ accountRole }),
    })
  ).data;
}
