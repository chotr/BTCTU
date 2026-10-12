"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui";
import { SettingsPanel } from "@/components/console/settings-panel";
import { IntegrationPanel } from "@/components/console/integration-panel";

const TABS = [
  ["settings", "Thiết lập"],
  ["integration", "Kết nối dữ liệu"],
] as const;

/**
 * Bảng điều khiển kỹ thuật ẩn (chỉ truy cập bằng URL, không liên kết trong
 * điều hướng chính): thông tin phiên/runtime, sandbox tích hợp mock và phạm vi quyền.
 */
export default function ConsolePage() {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("settings");
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Bảng điều khiển kỹ thuật"
        hint="Trang ẩn — chỉ truy cập bằng URL; phục vụ kiểm thử và trình diễn, không hiển thị trên menu."
      />
      <div
        role="tablist"
        aria-label="Nội dung bảng điều khiển"
        className="flex flex-wrap gap-1"
      >
        {TABS.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`rounded-ctl px-4 py-2 text-[13px] font-medium ${tab === id ? "bg-accent-50 text-accent-700" : "text-ink-2 hover:bg-fill"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "settings" && <SettingsPanel />}
      {tab === "integration" && <IntegrationPanel />}
    </div>
  );
}
