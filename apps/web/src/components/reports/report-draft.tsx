"use client";

import { Card } from "@/components/ui";

/** Thẻ báo cáo nháp có thể chỉnh sửa, thân thiện khi in. */
export function ReportDraft({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Card className="p-5">
      <h2 className="mb-3 text-sm font-semibold">
        Dự thảo báo cáo · cần người rà soát
      </h2>
      <textarea
        aria-label="Dự thảo báo cáo"
        className="control min-h-96 w-full py-3 text-[13px] leading-relaxed print:hidden"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <pre className="hidden whitespace-pre-wrap font-sans text-sm leading-relaxed print:block">
        {value}
      </pre>
      <p className="mt-3 text-xs text-ink-3 print:hidden">
        Chỉnh sửa trực tiếp, sau đó chọn In / lưu PDF. Không có thao tác ký hoặc
        ban hành tự động.
      </p>
    </Card>
  );
}
