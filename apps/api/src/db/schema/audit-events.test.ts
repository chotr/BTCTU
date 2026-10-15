import { PgDialect, getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import { AUDIT_OUTCOMES, auditEvents } from "./audit-events";

// Ràng buộc outcome nằm trong migration, còn danh sách giá trị hợp lệ nằm ở hằng AUDIT_OUTCOMES. Hai chỗ đó phải khớp nhau, nếu không thì cột audit chỉ chấp nhận đúng những giá trị mà mã không hề phát ra (hoặc ngược lại).
describe("audit_events", () => {
  it("ràng buộc outcome khớp đúng AUDIT_OUTCOMES", () => {
    const [constraint] = getTableConfig(auditEvents).checks;
    const sqlText = new PgDialect().sqlToQuery(constraint.value).sql;

    expect(constraint.name).toBe("audit_events_outcome_check");
    expect(sqlText).toContain("audit_events");
    expect(
      [...sqlText.matchAll(/'([A-Z_]+)'/g)].map((match) => match[1]),
    ).toEqual([...AUDIT_OUTCOMES]);
  });
});
