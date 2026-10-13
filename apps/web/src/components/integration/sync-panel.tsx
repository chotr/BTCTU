"use client";

import { useState } from "react";
import { Button, Card, Field, Input, Select } from "@/components/ui";
import { PROFILES, previewPayload, type ProfileKey } from "@/lib/api";

/** Kiểm tra đồng bộ phát triển: chọn hồ sơ, xem trước payload và chạy. */
export function SyncPanel({
  profile,
  setProfile,
  purpose,
  setPurpose,
  fail,
  setFail,
  busy,
  checkpoint,
  onSync,
}: {
  profile: ProfileKey;
  setProfile: (value: ProfileKey) => void;
  purpose: string;
  setPurpose: (value: string) => void;
  fail: boolean;
  setFail: (value: boolean) => void;
  busy: boolean;
  checkpoint: string;
  onSync: () => void;
}) {
  const [preview, setPreview] = useState(false);
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-sm font-semibold">Kiểm tra đồng bộ</h2>
      <div className="space-y-4">
        <Field label="Profile tích hợp">
          <Select
            className="w-full"
            value={profile}
            onChange={(e) => setProfile(e.target.value as ProfileKey)}
          >
            {Object.entries(PROFILES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.name}
              </option>
            ))}
          </Select>
        </Field>
        <p className="rounded-ctl bg-fill p-3 text-xs leading-relaxed text-ink-2">
          {PROFILES[profile].contract}
        </p>
        <Field label="Mục đích chia sẻ">
          <Input
            className="w-full"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </Field>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={fail}
            onChange={(e) => setFail(e.target.checked)}
          />
          Thử tình huống timeout để kiểm tra luồng phục hồi
        </label>
        <p className="text-xs text-ink-3">
          Allowlist: {PROFILES[profile].fields.join(", ")} · chỉ 5 bản ghi mẫu ·
          checkpoint {checkpoint}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setPreview((v) => !v)}>
            {preview ? "Ẩn payload" : "Xem payload giả"}
          </Button>
          <Button
            variant="primary"
            disabled={busy || purpose.trim().length < 5}
            onClick={onSync}
          >
            Chạy kiểm tra
          </Button>
        </div>
        {preview && (
          <pre className="max-h-64 overflow-auto rounded-ctl bg-fill p-3 text-[11px]">
            {JSON.stringify(previewPayload(), null, 2)}
          </pre>
        )}
      </div>
    </Card>
  );
}
