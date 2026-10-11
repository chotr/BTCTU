import { test, expect, type Page } from "@playwright/test";
async function login(page: Page, name: string) {
  await page.goto("/login");
  await page.getByRole("button", { name: new RegExp(name) }).click();
  await expect(page).toHaveURL(/dashboard/);
}
test("full demo slice persists across roles and reload, then locks and reopens", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await login(page, "Trần Minh Hòa");
  await page.goto("/periods");
  await page.getByRole("button", { name: "Tạo kỳ", exact: true }).click();
  await page.getByLabel("Tên kỳ", { exact: true }).fill("Kỳ demo E2E");
  await page.getByLabel("Từ ngày", { exact: true }).fill("2026-10-01");
  await page.getByLabel("Đến ngày", { exact: true }).fill("2026-12-31");
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Kỳ demo E2E", exact: true }),
  ).toBeVisible();
  await login(page, "Nguyễn Thị Lan");
  await page.goto("/tasks");
  await page
    .getByRole("button", { name: "Giao nhiệm vụ", exact: true })
    .click();
  await page
    .getByLabel("Danh mục đã công bố", { exact: true })
    .selectOption({ index: 1 });
  await page
    .getByLabel("Tên nhiệm vụ", { exact: true })
    .fill("Báo cáo tổng hợp E2E");
  await page
    .getByLabel("Người thực hiện", { exact: true })
    .selectOption("u-staff");
  await page
    .getByLabel("Kỳ nghiệp vụ", { exact: true })
    .selectOption({ label: "Kỳ demo E2E" });
  await page.getByLabel("Hạn hoàn thành", { exact: true }).fill("2026-12-25");
  await page
    .getByRole("button", { name: "Tạo và giao việc", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Báo cáo tổng hợp E2E", exact: true })
    .click();
  await page.waitForURL(/\/tasks\/NV-/);
  const taskUrl = page.url();
  await login(page, "Phạm Văn Đức");
  await page.goto(taskUrl);
  await page.getByLabel("Cập nhật tiến độ (%)", { exact: true }).fill("75");
  await page.getByRole("button", { name: "Lưu tiến độ", exact: true }).click();
  await page
    .getByLabel("Sản phẩm / kết quả", { exact: true })
    .fill("Sản phẩm synthetic E2E");
  await page.getByLabel("Ngày hoàn thành", { exact: true }).fill("2026-12-20");
  await page.getByLabel(/Tôi xác nhận tệp/).check();
  await page
    .getByLabel(/Chọn tệp mẫu/)
    .setInputFiles({
      name: "evidence-synthetic.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("SYNTHETIC ONLY"),
    });
  await expect(
    page.getByText("evidence-synthetic.txt").first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Nộp nghiệm thu", exact: true })
    .click();
  await expect(page.getByText("Chờ nghiệm thu", { exact: true })).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Sản phẩm synthetic E2E", { exact: true }),
  ).toBeVisible();
  await login(page, "Nguyễn Thị Lan");
  await page.goto(taskUrl);
  await page
    .getByRole("button", { name: "Yêu cầu chỉnh sửa", exact: true })
    .click();
  await page
    .getByLabel("Nhận xét / lý do", { exact: true })
    .fill("Bổ sung giải trình kiểm thử");
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await login(page, "Phạm Văn Đức");
  await page.goto(taskUrl);
  await page
    .getByLabel("Diễn giải kết quả", { exact: true })
    .fill("Đã bổ sung theo yêu cầu mock");
  await page
    .getByRole("button", { name: "Nộp nghiệm thu", exact: true })
    .click();
  await login(page, "Nguyễn Thị Lan");
  await page.goto(taskUrl);
  await page.getByRole("button", { name: "Nghiệm thu", exact: true }).click();
  await page
    .getByLabel("Nhận xét / lý do", { exact: true })
    .fill("Sản phẩm đủ căn cứ thử nghiệm");
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await expect(page.getByText("Đã nghiệm thu", { exact: true })).toBeVisible();
  await login(page, "Phạm Văn Đức");
  await page.goto("/evaluation");
  await page.getByRole("button", { name: "Tạo hồ sơ", exact: true }).click();
  await page
    .getByLabel("Kỳ đang mở", { exact: true })
    .selectOption({ label: "Kỳ demo E2E" });
  await page
    .getByLabel("Đối tượng được đánh giá", { exact: true })
    .selectOption("u-staff");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Tạo hồ sơ", exact: true })
    .click();
  await expect(page).toHaveURL(/evaluation\/EV-/);
  const evalUrl = page.url();
  await page.getByLabel("Điểm chung (0–30)", { exact: true }).fill("27");
  await page
    .getByRole("button", { name: "Tính và lưu snapshot", exact: true })
    .click();
  await expect(page.getByText("92.33", { exact: true })).toBeVisible();
  await page.getByLabel(/Không có trường hợp vi phạm/).check();
  await page.getByLabel(/Đủ điều kiện bắt buộc/).check();
  await page
    .getByLabel("Căn cứ xác nhận điều kiện", { exact: true })
    .fill("Đã đối chiếu dữ liệu tổng hợp giả lập");
  await page.getByRole("button", { name: "Lưu xác nhận", exact: true }).click();
  await page
    .getByRole("tab", { name: "Tự đánh giá / xử lý", exact: true })
    .click();
  await page
    .getByLabel("Nhận xét / căn cứ / lý do trả lại", { exact: true })
    .fill("Đã hoàn thành nhiệm vụ trong kỳ demo");
  await page
    .getByRole("button", { name: "Nộp tự đánh giá", exact: true })
    .click();
  await login(page, "Nguyễn Thị Lan");
  await page.goto(evalUrl);
  await page
    .getByRole("tab", { name: "Tự đánh giá / xử lý", exact: true })
    .click();
  await page
    .getByLabel("Nhận xét / căn cứ / lý do trả lại", { exact: true })
    .fill("Thẩm định mock đã kiểm tra sản phẩm");
  await page
    .getByRole("button", { name: "Thẩm định và trình", exact: true })
    .click();
  await login(page, "Trần Minh Hòa");
  await page.goto(evalUrl);
  await page
    .getByRole("tab", { name: "Tự đánh giá / xử lý", exact: true })
    .click();
  await page
    .getByLabel("Nhận xét / căn cứ / lý do trả lại", { exact: true })
    .fill("Quyết định mô phỏng theo hồ sơ và điều kiện");
  await page
    .getByRole("button", { name: "Quyết định xếp loại", exact: true })
    .click();
  await expect(page.getByText("Đã quyết định", { exact: true })).toBeVisible();
  await page.goto("/periods");
  const periodCard = page
    .getByRole("heading", { name: "Kỳ demo E2E", exact: true })
    .locator("..")
    .locator("..");
  await periodCard
    .getByRole("button", { name: "Khóa kỳ", exact: true })
    .click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await expect(periodCard.getByText("Đã khóa", { exact: true })).toBeVisible();
  await page.goto(taskUrl);
  await expect(
    page.getByText("Kỳ đã khóa — chỉ đọc", { exact: true }),
  ).toBeVisible();
  await page.goto("/reports");
  await page
    .getByLabel("Kỳ báo cáo", { exact: true })
    .selectOption({ label: "Kỳ demo E2E" });
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "CSV đánh giá", exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(
    /BTCTU-demo-evaluations.*\.csv/,
  );
  await page.goto("/periods");
  await page
    .getByRole("heading", { name: "Kỳ demo E2E", exact: true })
    .locator("..")
    .locator("..")
    .getByRole("button", { name: "Mở lại kỳ", exact: true })
    .click();
  await page
    .getByLabel("Lý do mở lại", { exact: true })
    .fill("Kiểm thử điều chỉnh sau khóa");
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await page.goto(evalUrl);
  await page
    .getByRole("tab", { name: "Lần tính & lịch sử", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Quyết định trước khi mở lại",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText(/92.33 điểm/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("all screens render; imports, integration retry and keyboard dialog work", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await login(page, "Trần Minh Hòa");
  for (const path of [
    "/organization",
    "/catalog",
    "/tasks",
    "/evaluation",
    "/approvals",
    "/periods",
    "/reports",
    "/audit",
    "/integration",
    "/settings",
    "/dashboard",
  ]) {
    await page.goto(path);
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Application error");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.screenshot({
    path: "test-results/dashboard-desktop.png",
    fullPage: true,
  });
  await page.goto("/catalog");
  await page.getByRole("button", { name: "Nhập dữ liệu", exact: true }).click();
  await page
    .getByLabel("Tên phiên bản nháp đích", { exact: true })
    .fill("v-e2e");
  await page
    .getByLabel("Nội dung CSV", { exact: true })
    .fill(
      "code,name,product,unit,complexity,standardScore,coefficient,durationDays,sourceRef\nTEST-01,Công việc nhập thử,Báo cáo,Sản phẩm,Thấp,10,1,5,Synthetic\n",
    );
  await page
    .getByRole("button", { name: "Kiểm tra dữ liệu", exact: true })
    .click();
  await expect(page.getByText(/1 dòng · 0 dòng lỗi/)).toBeVisible();
  await page
    .getByRole("button", { name: "Xác nhận nhập", exact: true })
    .click();
  await expect(
    page.getByText("Công việc nhập thử", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Công bố phiên bản", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/integration");
  await page.getByLabel(/Giả lập lỗi timeout/).check();
  await page
    .getByRole("button", { name: "Chạy mô phỏng", exact: true })
    .click();
  await expect(page.getByText("FAILED", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Thử lại", exact: true }).click();
  await expect(page.getByText("SUCCESS", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("mobile navigation and staff scope, including denied direct routes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, "Phạm Văn Đức");
  await expect(
    page.getByRole("button", { name: "Mở điều hướng", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Mở điều hướng", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Nhiệm vụ", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Giao nhiệm vụ", exact: true }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/tasks-mobile.png",
    fullPage: true,
  });
  for (const path of [
    "/dashboard",
    "/catalog",
    "/organization",
    "/evaluation",
    "/reports",
    "/periods",
    "/settings",
  ]) {
    await page.goto(path);
    await expect(page.locator("main#main-content")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/audit");
  await expect(
    page.getByText("Không có quyền xem nhật ký kiểm toán", { exact: true }),
  ).toBeVisible();
  await page.goto("/evaluation/EV-Q3-HOA");
  await expect(
    page.getByText("Không thể mở hồ sơ", { exact: true }),
  ).toBeVisible();
  await page.goto("/integration");
  await expect(
    page.getByText("Kết nối dữ liệu ngoài phạm vi của bạn", { exact: true }),
  ).toBeVisible();
});
