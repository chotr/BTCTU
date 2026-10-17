"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui";
import { SettingsPanel } from "@/components/console/settings-panel";
import { IntegrationPanel } from "@/components/console/integration-panel";
import { isApiWorkspace } from "@/lib/workspace-runtime";

const TABS = [
  ["settings", "Thiết lập"],
  ["integration", "Kết nối dữ liệu"],
] as const;

export default function ConsolePage() {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("settings");
  const apiMode = isApiWorkspace();
  const tabs = apiMode ? TABS.slice(0, 1) : TABS;
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Bảng điều khiển kỹ thuật"
        hint="Theo dõi môi trường hoạt động và cấu hình hệ thống."
      />
      <div
        role="tablist"
        aria-label="Nội dung bảng điều khiển"
        className="flex flex-wrap gap-1"
      >
        {tabs.map(([id, label]) => (
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
      {!apiMode && tab === "integration" && <IntegrationPanel />}
    </div>
  );
}
