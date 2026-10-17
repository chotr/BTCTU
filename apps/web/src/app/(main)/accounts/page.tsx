"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Plus } from "@phosphor-icons/react";
import {
  createManagedAccount,
  listAccountCandidates,
  listManagedAccounts,
  resetManagedPassword,
  updateManagedAccount,
  updateManagedRole,
  type AccountCandidate,
  type ManagedAccount,
} from "@/lib/account-admin";
import { ApiError } from "@/lib/http-client";
import { useApp } from "@/lib/store";
import { Badge, Button, Card, Field, Input, Modal, SectionHeader, Select } from "@/components/ui";

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Không thể cập nhật tài khoản. Vui lòng thử lại.";
}

export default function AccountsPage() {
  const { account } = useApp();
  const [accounts, setAccounts] = useState<ManagedAccount[]>([]);
  const [candidates, setCandidates] = useState<AccountCandidate[]>([]);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [directoryActorId, setDirectoryActorId] = useState("");
  const [initialPassword, setInitialPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isRoot = account?.accountRole === "ROOT";

  const load = useCallback(async () => {
    try {
      const [nextAccounts, nextCandidates] = await Promise.all([
        listManagedAccounts(),
        listAccountCandidates(),
      ]);
      setAccounts(nextAccounts);
      setCandidates(nextCandidates);
    } catch (reason) {
      setError(errorMessage(reason));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const created = await createManagedAccount({
        email,
        directoryActorId,
        initialPassword,
      });
      setAccounts((items) => [...items, created].sort((a, b) => a.email.localeCompare(b.email)));
      setCandidates((items) => items.filter((item) => item.id !== directoryActorId));
      setOpen(false);
      setEmail("");
      setDirectoryActorId("");
      setInitialPassword("");
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(item: ManagedAccount) {
    try {
      const updated = await updateManagedAccount(item.id, {
        status: item.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
      });
      setAccounts((items) => items.map((value) => (value.id === item.id ? updated : value)));
    } catch (reason) {
      setError(errorMessage(reason));
    }
  }

  async function resetPassword(item: ManagedAccount) {
    const temporaryPassword = window.prompt("Nhập mật khẩu tạm thời mới (ít nhất 8 ký tự):");
    if (!temporaryPassword) return;
    try {
      const updated = await resetManagedPassword(item.id, temporaryPassword);
      setAccounts((items) => items.map((value) => (value.id === item.id ? updated : value)));
    } catch (reason) {
      setError(errorMessage(reason));
    }
  }

  async function changeRole(item: ManagedAccount) {
    try {
      const updated = await updateManagedRole(
        item.id,
        item.accountRole === "ACCOUNT_ADMIN" ? "USER" : "ACCOUNT_ADMIN",
      );
      setAccounts((items) => items.map((value) => (value.id === item.id ? updated : value)));
    } catch (reason) {
      setError(errorMessage(reason));
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Quản lý tài khoản"
        hint="Cấp tài khoản cho nhân sự, khóa tài khoản và đặt lại mật khẩu."
        actions={<Button variant="primary" icon={<Plus size={16} />} onClick={() => setOpen(true)}>Tạo tài khoản</Button>}
      />
      {error ? <p role="alert" className="text-[13px] text-danger">{error}</p> : null}
      <Card className="overflow-x-auto">
        <table className="min-w-[760px] w-full text-left text-[13px]">
          <thead className="bg-fill text-ink-2">
            <tr>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Nhân sự</th>
              <th className="px-3 py-2 font-medium">Trạng thái</th>
              <th className="px-3 py-2 font-medium">Quyền tài khoản</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {accounts.map((item) => (
              <tr key={item.id} className="border-t border-fill-2">
                <td className="px-3 py-3">{item.email}</td>
                <td className="px-3 py-3 text-ink-2">{item.directoryActorId ?? "Tài khoản hệ thống"}</td>
                <td className="px-3 py-3"><Badge tone={item.status === "ACTIVE" ? "ok" : "warn"}>{item.status === "ACTIVE" ? "Đang hoạt động" : "Đã khóa"}</Badge></td>
                <td className="px-3 py-3">{item.accountRole === "ROOT" ? "Root" : item.accountRole === "ACCOUNT_ADMIN" ? "Quản trị viên tài khoản" : "Người dùng"}</td>
                <td className="px-3 py-3"><div className="flex justify-end gap-2">
                  {item.accountRole !== "ROOT" ? <Button onClick={() => void changeStatus(item)}>{item.status === "ACTIVE" ? "Khóa" : "Mở khóa"}</Button> : null}
                  {item.accountRole !== "ROOT" ? <Button onClick={() => void resetPassword(item)}>Đặt lại mật khẩu</Button> : null}
                  {isRoot && item.accountRole !== "ROOT" ? <Button onClick={() => void changeRole(item)}>{item.accountRole === "ACCOUNT_ADMIN" ? "Thu hồi quyền admin" : "Cấp quyền admin"}</Button> : null}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal open={open} title="Tạo tài khoản nhân sự" onClose={() => setOpen(false)}>
        <form onSubmit={create} className="space-y-3">
          <Field label="Nhân sự"><Select required className="w-full" value={directoryActorId} onChange={(event) => setDirectoryActorId(event.target.value)}><option value="">Chọn nhân sự chưa có tài khoản</option>{candidates.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.title}</option>)}</Select></Field>
          <Field label="Email"><Input type="email" required className="w-full" value={email} onChange={(event) => setEmail(event.target.value)} /></Field>
          <Field label="Mật khẩu khởi tạo"><Input type="password" required minLength={8} className="w-full" value={initialPassword} onChange={(event) => setInitialPassword(event.target.value)} /></Field>
          <p className="text-[12px] text-ink-3">Người dùng sẽ phải đổi mật khẩu này trong lần đăng nhập đầu tiên.</p>
          <div className="flex justify-end gap-2"><Button onClick={() => setOpen(false)}>Hủy</Button><Button type="submit" variant="primary" disabled={busy}>{busy ? "Đang tạo…" : "Tạo tài khoản"}</Button></div>
        </form>
      </Modal>
    </div>
  );
}
