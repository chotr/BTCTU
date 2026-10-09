# Evaluation / KPI model

## Model đề xuất, chưa phải quy định

`EvaluationPeriod → Evaluation → CriterionVersion → ScoreComponent → CalculationRun → ClassificationDecision`

Nguyên tắc thiết kế:

- formula/criterion versioned và effective-dated;
- calculation reproducible từ snapshot input;
- manual override cần lý do, người thực hiện, thời điểm và audit;
- self score tách reviewer score/approved score;
- không lưu “điểm hiện tại” mà mất lịch sử calculation.

## TBD khóa implementation

Thang điểm, trọng số, làm tròn, điều kiện chặn, cách tính nhiệm vụ không hoàn thành/quá hạn, ngưỡng xếp loại, đối tượng/kỳ đánh giá và quyền override. Chờ 05-HD/TU + 39-QĐ/TU.

