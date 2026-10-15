import {
  date,
  index,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Loại quan hệ nhân sự trong cơ cấu. Cán bộ công an biệt phái là một quan hệ được
// biệt phái vào đơn vị/vị trí trong một khoảng thời gian, nên nó thuộc về dòng
// phân công chứ không phải thuộc tính của người hay của vị trí. Không đặt giá trị
// mặc định: gán ngầm STAFF cho một người biệt phái là ghi sai nguồn.
export const assignmentTypeEnum = pgEnum("assignment_type", [
  "STAFF",
  "SECONDMENT",
]);

// Bốn đơn vị của Ban Tổ chức Tỉnh ủy (QĐ01 Điều 2–6). Tên là trường duy nhất
// nguồn xác nhận; mã chính thức chưa có văn bản nào phê duyệt.
export const departments = pgTable("departments", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: varchar("name", { length: 255 }).notNull(),

  // Cách viết ngắn trong workbook vận hành, chỉ là bí danh hiển thị.
  shortName: varchar("short_name", { length: 128 }),

  // Chờ văn bản có thẩm quyền; không tự gán mã hành chính.
  officialCode: varchar("official_code", { length: 64 }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Hồ sơ nhân sự hiện chỉ có từ workbook vận hành. Chưa có hệ thống master, chưa có
// mã cán bộ chuẩn, nên khoá nội bộ là UUID và tên không được dùng làm định danh.
export const people = pgTable("people", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: varchar("name", { length: 255 }).notNull(),

  // Mã cán bộ từ hệ thống chủ quản, khi hệ thống đó được xác định.
  externalId: varchar("external_id", { length: 255 }),

  sourceRef: varchar("source_ref", { length: 255 }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Chức danh. QĐ01 chỉ xác nhận cơ cấu thành phần, không có danh mục vị trí việc
// làm đầy đủ, nên bảng này giữ những chức danh nguồn thực sự nêu.
export const positions = pgTable("positions", {
  id: uuid("id").primaryKey().defaultRandom(),

  title: varchar("title", { length: 255 }).notNull(),

  // Mã vị trí từ hệ thống chủ quản, khi hệ thống đó được xác định.
  externalId: varchar("external_id", { length: 255 }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Quan hệ phân công: ai giữ chức danh nào ở đơn vị nào. Bảng hỗ trợ lịch sử ngay từ
// đầu, nhưng dữ liệu hiện có là ảnh chụp tại một thời điểm nên hai cột hiệu lực để
// trống — nguồn không nói người đó bắt đầu nhiệm vụ từ ngày nào.
export const positionAssignments = pgTable(
  "position_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "restrict" }),

    positionId: uuid("position_id")
      .notNull()
      .references(() => positions.id, { onDelete: "restrict" }),

    departmentId: uuid("department_id")
      .notNull()
      .references(() => departments.id, { onDelete: "restrict" }),

    assignmentType: assignmentTypeEnum("assignment_type").notNull(),

    validFrom: date("valid_from"),

    validTo: date("valid_to"),

    sourceRef: varchar("source_ref", { length: 255 }),

    // Nhãn căn cứ theo quy ước ở docs/02-source-analysis/README.md.
    sourceClass: varchar("source_class", { length: 32 }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("position_assignments_person_id_idx").on(table.personId),
    index("position_assignments_position_id_idx").on(table.positionId),
    index("position_assignments_department_id_idx").on(table.departmentId),
  ],
);

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
export type Person = typeof people.$inferSelect;
export type NewPerson = typeof people.$inferInsert;
export type Position = typeof positions.$inferSelect;
export type NewPosition = typeof positions.$inferInsert;
export type PositionAssignment = typeof positionAssignments.$inferSelect;
export type NewPositionAssignment = typeof positionAssignments.$inferInsert;
