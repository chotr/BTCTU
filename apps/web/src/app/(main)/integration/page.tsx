"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { canManage } from "@/lib/policy";
import { saveMappings, simulateSync, type ProfileKey } from "@/lib/integration";
import { useBusy } from "@/components/use-busy";
import { Badge, Callout, Card, EmptyState, SectionHeader } from "@/components/ui";
import {
  MappingCard,
  SyncPanel,
  SyncRunsTable,
} from "@/components/integration";

export default function IntegrationPage() {
  const state = useApp();
  const [profile, setProfile] = useState<ProfileKey>("personnel");
  const [purpose, setPurpose] = useState(
    "Đối soát danh mục nhân sự tổng hợp",
  );
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
    await run(() => simulateSync(p, reason, retryOf ? false : fail, retryOf));
  }
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Kết nối dữ liệu"
        hint="Future-state sandbox · không gọi API bên ngoài, không thu thập khóa bí mật."
        actions={<Badge tone="warn">CHỜ API</Badge>}
      />
      <Callout title="Hai profile hợp đồng độc lập" tone="neutral">
        QĐ607 và HD07 không được gộp thành một cơ chế xác thực. Các trường bên
        dưới là ánh xạ đang chờ phê duyệt dựa trên QĐ308/QĐ607; endpoint, quyền, scope và
        hợp đồng chính thức còn TBD.
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
          onSave={() => saveMappings(mappings)}
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
