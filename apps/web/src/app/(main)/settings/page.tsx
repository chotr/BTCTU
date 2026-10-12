"use client";
import Link from "next/link";
import { useState } from "react";
import { resetWorkspace, useApp } from "@/lib/store";
import { runtimeConfig, runtimeLabel } from "@/lib/runtime-config";
import {
  Badge,
  Button,
  Callout,
  Card,
  Modal,
  SectionHeader,
} from "@/components/ui";
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
export default function SettingsPage() {
  const [open, setOpen] = useState(false);
  const state = useApp();
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Thiết lập hệ thống"
        hint="Thông tin phiên, nguồn dữ liệu và phạm vi phân quyền."
      />
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
                : "Lưu cục bộ · schema v2"}
            </Badge>
            <Badge>{state.tasks.length} nhiệm vụ</Badge>
            <Badge tone={runtimeConfig.dataSource === "api" ? "ok" : "warn"}>
              {runtimeLabel()}
            </Badge>
          </div>
          <p className="my-4 text-xs leading-relaxed text-ink-3">
            Đổi tài khoản vẫn giữ dữ liệu. Khôi phục không gian làm việc sẽ xóa
            các thay đổi cục bộ trên trình duyệt này và giữ phiên đăng nhập.
          </p>
          <Button onClick={() => setOpen(true)}>
            Khôi phục không gian làm việc
          </Button>
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold">
            Quy trình kiểm tra nghiệp vụ
          </h2>
          <ol className="space-y-3 text-[13px] text-ink-2">
            <li>
              1.{" "}
              <Link className="text-accent-700" href="/periods">
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
        <h2 className="p-4 text-sm font-semibold">
          Ma trận quyền cấu hình
        </h2>
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
      <Callout title="Các cổng xác nhận còn mở" tone="neutral">
        INC-01 số học ví dụ nguồn; INC-02 công thức nhân viên; nhóm/hạn mức Xuất
        sắc; thẩm quyền cụ thể; quy tắc tháng→quý→năm; quy trình mở lại; hợp
        đồng API và cấp độ ATTT. Các quy tắc chưa được phê duyệt không tự kích
        hoạt trong môi trường chính thức.
      </Callout>
      <Modal
        open={open}
        title="Khôi phục không gian làm việc?"
        onClose={() => setOpen(false)}
      >
        <p className="text-sm leading-relaxed">
          Thay đổi nhiệm vụ, danh mục, đánh giá và nhật ký bạn vừa tạo sẽ được
          thay bằng bộ mẫu. Hãy xuất báo cáo cần giữ trước khi xác nhận.
        </p>
        <div className="flex justify-end gap-2">
          <Button onClick={() => setOpen(false)}>Giữ dữ liệu</Button>
          <Button
            variant="danger"
            onClick={() => {
              resetWorkspace();
              setOpen(false);
            }}
          >
            Khôi phục bộ mẫu
          </Button>
        </div>
      </Modal>
    </div>
  );
}
