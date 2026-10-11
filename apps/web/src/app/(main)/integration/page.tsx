"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { canManage } from "@/lib/policy";
import {
  PROFILES,
  previewPayload,
  saveMappings,
  simulateSync,
  type ProfileKey,
} from "@/lib/integration";
import { fmtDateTime } from "@/lib/format";
import { useBusy } from "@/components/use-busy";
import {
  Badge,
  Button,
  Callout,
  Card,
  EmptyState,
  Field,
  Input,
  SectionHeader,
  Select,
} from "@/components/ui";
export default function IntegrationPage() {
  const state = useApp();
  const [profile, setProfile] = useState<ProfileKey>("personnel");
  const [purpose, setPurpose] = useState(
    "Đối soát danh mục nhân sự tổng hợp trong demo",
  );
  const [fail, setFail] = useState(false);
  const { busy, run } = useBusy();
  const [mappings, setMappings] = useState(state.integration.mappings);
  const [preview, setPreview] = useState(false);
  if (!canManage(state.user))
    return (
      <Card>
        <EmptyState
          title="Kết nối dữ liệu ngoài phạm vi của bạn"
          hint="Chỉ lãnh đạo demo xem cấu hình kết nối mô phỏng."
        />
      </Card>
    );
  async function sync(retryOf?: string, p = profile, reason = purpose) {
    await run(() => simulateSync(p, reason, retryOf ? false : fail, retryOf));
  }
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Kết nối dữ liệu"
        hint="Future-state sandbox · không gọi API bên ngoài, không thu thập khóa bí mật."
        actions={<Badge tone="warn">MOCK ONLY</Badge>}
      />
      <Callout title="Hai profile hợp đồng độc lập" tone="neutral">
        QĐ607 và HD07 không được gộp thành một cơ chế xác thực. Các trường bên
        dưới là ánh xạ ứng viên dựa trên QĐ308/QĐ607; endpoint, quyền, scope và
        hợp đồng chính thức còn TBD.
      </Callout>
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold">Mô phỏng đồng bộ</h2>
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
              Giả lập lỗi timeout để thử luồng phục hồi
            </label>
            <p className="text-xs text-ink-3">
              Allowlist: {PROFILES[profile].fields.join(", ")} · chỉ 5 bản ghi
              mẫu · checkpoint {state.integration.checkpoint}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setPreview((v) => !v)}>
                {preview ? "Ẩn payload" : "Xem payload giả"}
              </Button>
              <Button
                variant="primary"
                disabled={busy || purpose.trim().length < 5}
                onClick={() => sync()}
              >
                Chạy mô phỏng
              </Button>
            </div>
            {preview && (
              <pre className="max-h-64 overflow-auto rounded-ctl bg-fill p-3 text-[11px]">
                {JSON.stringify(previewPayload(), null, 2)}
              </pre>
            )}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold">Ánh xạ từ điển dữ liệu</h2>
          <div className="space-y-4">
            {mappings.map((m, i) => (
              <Field key={m.field} label={m.field} hint={m.source}>
                <Select
                  className="w-full"
                  value={m.target}
                  onChange={(e) =>
                    setMappings((rows) =>
                      rows.map((r, j) =>
                        j === i ? { ...r, target: e.target.value } : r,
                      ),
                    )
                  }
                >
                  {PROFILES[profile].fields.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </Select>
              </Field>
            ))}
            <Button onClick={() => saveMappings(mappings)}>Lưu ánh xạ</Button>
            <p className="text-xs leading-relaxed text-ink-3">
              Không đồng bộ vào danh sách nhân sự nội bộ một cách tự động. Kết
              quả là nhật ký đối soát giả, không thay đổi master data.
            </p>
          </div>
        </Card>
      </div>
      <Card className="overflow-x-auto">
        <h2 className="p-4 text-sm font-semibold">
          Lịch sử / checkpoint / thử lại
        </h2>
        {state.integration.runs.length ? (
          <table className="w-full min-w-[950px] text-[13px]">
            <thead className="bg-fill text-left text-xs text-ink-3">
              <tr>
                {[
                  "Thời gian / profile",
                  "Kết quả",
                  "Đối soát",
                  "Correlation ID",
                  "Chi tiết",
                  "",
                ].map((h, i) => (
                  <th key={i} className="p-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.integration.runs.map((r) => (
                <tr key={r.id} className="shadow-[0_1px_0_#edf1f6]">
                  <td className="p-3">
                    {fmtDateTime(r.at)}
                    <p className="mt-1 text-xs text-ink-3">
                      {PROFILES[r.profile as ProfileKey]?.name}
                    </p>
                  </td>
                  <td className="p-3">
                    <Badge tone={r.status === "SUCCESS" ? "ok" : "danger"}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {r.records} bản ghi
                    <p className="mt-1 text-xs text-ink-3">
                      Checkpoint {r.checkpoint}
                    </p>
                  </td>
                  <td className="p-3 font-mono text-xs">{r.correlationId}</td>
                  <td className="max-w-72 p-3 text-xs text-ink-2">
                    {r.error ?? r.purpose}
                    {r.retryOf && (
                      <p className="mt-1">Retry của {r.retryOf.slice(0, 8)}</p>
                    )}
                  </td>
                  <td className="p-3">
                    {r.status === "FAILED" &&
                      !state.integration.runs.some(
                        (x) => x.retryOf === r.id && x.status === "SUCCESS",
                      ) && (
                        <Button
                          disabled={busy}
                          onClick={() =>
                            sync(r.id, r.profile as ProfileKey, r.purpose)
                          }
                        >
                          Thử lại
                        </Button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            title="Chưa chạy đồng bộ mô phỏng"
            hint="Xem payload rồi chạy thành công hoặc thử tình huống lỗi."
          />
        )}
      </Card>
    </div>
  );
}
