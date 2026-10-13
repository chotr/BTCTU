"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { canManage } from "@/lib/policy";
import { api, type ProfileKey } from "@/lib/api";
import { useBusy } from "@/components/use-busy";
import { Badge, Callout, Card, EmptyState } from "@/components/ui";
import {
  MappingCard,
  SyncPanel,
  SyncRunsTable,
} from "@/components/integration";

/** Tab bảng điều khiển: sandbox tích hợp mock (hồ sơ, ánh xạ, kiểm tra đồng bộ). */
export function IntegrationPanel() {
  const state = useApp();
  const [profile, setProfile] = useState<ProfileKey>("personnel");
  const [purpose, setPurpose] = useState("Đối soát danh mục nhân sự tổng hợp");
  const [fail, setFail] = useState(false);
  const { busy, run } = useBusy();
  const [mappings, setMappings] = useState(state.integration.mappings);
  if (!canManage(state.user))
    return (
      <Card>
        <EmptyState
          title="Kết nối dữ liệu ngoài phạm vi của bạn"
          hint="Chỉ tài khoản lãnh đạo được xem cấu hình kết nối."
        />
      </Card>
    );
  async function sync(retryOf?: string, p = profile, reason = purpose) {
    await run(() =>
      api.simulateSync(p, reason, retryOf ? false : fail, retryOf),
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-ink-3">
          Sandbox trạng thái tương lai · không gọi API ngoài, không thu thập
          khóa bí mật.
        </p>
        <Badge tone="warn">CHỜ API</Badge>
      </div>
      <Callout title="Hai profile hợp đồng độc lập" tone="neutral">
        QĐ607 và HD07 không được gộp thành một cơ chế xác thực. Các trường bên
        dưới là ánh xạ đang chờ phê duyệt dựa trên QĐ308/QĐ607; endpoint, quyền,
        scope và hợp đồng chính thức còn TBD.
      </Callout>
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <SyncPanel
          profile={profile}
          setProfile={setProfile}
          purpose={purpose}
          setPurpose={setPurpose}
          fail={fail}
          setFail={setFail}
          busy={busy}
          checkpoint={state.integration.checkpoint}
          onSync={() => sync()}
        />
        <MappingCard
          profile={profile}
          mappings={mappings}
          onTargetChange={(i, target) =>
            setMappings((rows) =>
              rows.map((r, j) => (j === i ? { ...r, target } : r)),
            )
          }
          onSave={() => api.saveMappings(mappings)}
        />
      </div>
      <SyncRunsTable
        runs={state.integration.runs}
        busy={busy}
        onRetry={(r) => sync(r.id, r.profile as ProfileKey, r.purpose)}
      />
    </div>
  );
}
