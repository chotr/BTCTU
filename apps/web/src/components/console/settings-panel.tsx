"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { environmentLabel } from "@/lib/runtime-config";
import { appPath, isApiWorkspace } from "@/lib/workspace-runtime";
import { Badge, Button, Callout, Card, Modal } from "@/components/ui";

const rows = [
  ["Nhân sự / đơn vị", "Toàn Ban", "Nhân sự phòng mình", "Xem phòng mình"],
  ["Danh mục / công bố", "Quản lý", "Xem", "Xem"],
  [
    "Giao và nghiệm thu việc",
    "Toàn Ban; không tự nghiệm thu",
    "Trong phòng; không tự nghiệm thu",
    "Kết quả việc được giao",
  ],
  [
    "Tự đánh giá",
    "Cá nhân của mình",
    "Cá nhân + đại diện phòng",
    "Cá nhân của mình",
  ],
  [
    "Thẩm định",
    "Trong phạm vi; không tự thẩm định",
    "Cá nhân trong phòng, trừ mình",
    "Không",
  ],
  ["Quyết định / khóa / mở lại", "Có lý do + audit", "Không", "Không"],
  ["Báo cáo", "Toàn Ban", "Phạm vi phòng", "Cá nhân"],
  ["Quản lý kết nối dữ liệu", "Có", "Không", "Không"],
];

/** Tab bảng điều khiển: phiên/runtime, đặt lại, ma trận quyền và các cổng đang mở. */
export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const state = useApp();
  const apiMode = isApiWorkspace();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold">Phiên làm việc</h2>
          <p className="text-[13px]">
            {state.user?.name} · {state.user?.title}
          </p>
          <p className="mt-2 text-xs text-ink-3">
            {state.user?.departmentName ?? "Toàn Ban"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone={state.storageError ? "warn" : "ok"}>
              {state.storageError
                ? "Lưu trữ cần kiểm tra"
                : apiMode
                  ? "Dữ liệu từ API"
                  : "Lưu cục bộ · schema v3"}
            </Badge>
            <Badge>{state.tasks.length} nhiệm vụ</Badge>
            <Badge tone={apiMode ? "ok" : "warn"}>
              {environmentLabel()} · {apiMode ? "API dịch vụ" : "Dữ liệu mô phỏng"}
            </Badge>
          </div>
          <p className="my-4 text-xs leading-relaxed text-ink-3">
            {apiMode
              ? "Tải lại để lấy bản dữ liệu mới nhất từ API."
              : "Đổi tài khoản vẫn giữ dữ liệu. Khôi phục sẽ thay dữ liệu cục bộ bằng bộ mẫu."}
          </p>
          <Button onClick={() => setOpen(true)}>
            {apiMode
              ? "Tải lại từ API"
              : "Khôi phục không gian làm việc"}
          </Button>
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold">
            Quy trình kiểm tra nghiệp vụ
          </h2>
          <ol className="space-y-3 text-[13px] text-ink-2">
            <li>
              1.{" "}
              <Link className="text-accent-700" href={appPath("/periods")}>
                Tạo kỳ đánh giá
              </Link>
              , tạo nhân sự và công việc từ danh mục đã công bố.
            </li>
            <li>
              2. Đổi sang người được giao; nhập sản phẩm, metadata minh chứng và
              nộp.
            </li>
            <li>
              3. Trưởng phòng trả lại / nghiệm thu; công chức tính KPI và tự
              đánh giá.
            </li>
            <li>
              4. Thẩm định điều kiện, đề xuất; lãnh đạo quyết định và khóa kỳ.
            </li>
            <li>
              5. Kiểm tra từ chối sửa sau khóa, mở lại có lý do, xem snapshot,
              CSV và audit.
            </li>
          </ol>
        </Card>
      </div>
      <Card className="overflow-x-auto">
        <h2 className="p-4 text-sm font-semibold">Ma trận quyền cấu hình</h2>
        <table className="w-full min-w-[800px] text-[13px]">
          <thead className="bg-fill text-left text-xs text-ink-3">
            <tr>
              {["Chức năng", "Lãnh đạo", "Trưởng phòng", "Công chức"].map(
                (h) => (
                  <th className="p-3" key={h}>
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]} className="shadow-[0_1px_0_#edf1f6]">
                {row.map((v, i) => (
                  <td key={i} className="p-3">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal
        open={open}
        title={
          apiMode
            ? "Tải lại dữ liệu từ API?"
            : "Khôi phục không gian làm việc?"
        }
        onClose={() => setOpen(false)}
      >
        <p className="text-sm leading-relaxed">
          {apiMode
            ? "Dữ liệu trên màn hình sẽ được thay bằng bản mới nhất từ API."
            : "Dữ liệu hiện tại sẽ được thay bằng bộ mẫu. Hãy xuất báo cáo cần giữ trước khi xác nhận."}
        </p>
        <div className="flex justify-end gap-2">
          <Button onClick={() => setOpen(false)}>Giữ dữ liệu</Button>
          <Button
            variant="danger"
            onClick={() => {
              api.resetWorkspace();
              setOpen(false);
            }}
          >
            {apiMode
              ? "Tải lại"
              : "Khôi phục bộ mẫu"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
