import { getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import {
  assignmentTypeEnum,
  departments,
  people,
  positionAssignments,
  positions,
} from "./organization";

function columnOf(table: Parameters<typeof getTableConfig>[0], name: string) {
  const column = getTableConfig(table).columns.find(
    (candidate) => candidate.name === name,
  );
  if (!column) throw new Error(`không thấy cột ${name}`);
  return column;
}

// Các quyết định dưới đây là chốt của ORG-001, không phải chi tiết triển khai:
// đổi chúng là đổi cách hệ thống được phép nói về dữ liệu nhân sự.
describe("schema tổ chức", () => {
  it("chỉ có hai loại quan hệ nhân sự và không có giá trị mặc định", () => {
    expect([...assignmentTypeEnum.enumValues]).toEqual(["STAFF", "SECONDMENT"]);

    const column = columnOf(positionAssignments, "assignment_type");
    expect(column.notNull).toBe(true);
    expect(column.hasDefault).toBe(false);
  });

  it("để trống ngày hiệu lực thay vì suy diễn từ ảnh chụp nguồn", () => {
    expect(columnOf(positionAssignments, "valid_from").notNull).toBe(false);
    expect(columnOf(positionAssignments, "valid_to").notNull).toBe(false);
  });

  it("buộc mỗi phân công phải có người, vị trí và đơn vị", () => {
    expect(columnOf(positionAssignments, "person_id").notNull).toBe(true);
    expect(columnOf(positionAssignments, "position_id").notNull).toBe(true);
    expect(columnOf(positionAssignments, "department_id").notNull).toBe(true);
  });

  it("phân công tham chiếu đúng ba bảng và không xoá dây chuyền", () => {
    const foreignKeys = getTableConfig(positionAssignments).foreignKeys;

    expect(
      foreignKeys.map((foreignKey) =>
        getTableName(foreignKey.reference().foreignTable),
      ),
    ).toEqual(["people", "positions", "departments"]);
    expect(foreignKeys.map((foreignKey) => foreignKey.onDelete)).toEqual([
      "restrict",
      "restrict",
      "restrict",
    ]);
  });

  it("không dùng tên người hay tên chức danh làm định danh", () => {
    for (const table of [people, positions, departments]) {
      const config = getTableConfig(table);
      expect(config.uniqueConstraints).toEqual([]);
      expect(config.columns.filter((column) => column.isUnique)).toEqual([]);
    }
  });
});
