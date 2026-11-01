# Money Lab — kiểm tra cân bằng bản 22

Ngày: 01/11/2026 · Nền tảng trước thay đổi: bản 21, commit `0c5fed56790418c3b79a71e443996de5686f04b8`.

## Phương pháp và giới hạn

Mỗi bộ: 24.000 chặng độc lập = 3 cấp × 4 chiến thuật × 2.000 seed. Bộ so sánh dùng seed 1–2000; bộ kiểm chứng dùng seed 2001–4000. Tổng 72.000 chặng trong ba báo cáo. Đây là mô phỏng engine offline, không phải thử nghiệm người dùng, không gọi RPC hay thay đổi ví/HUB người chơi.

Các chiến thuật là gói quyết định: giữ tiền; ưu tiên dự phòng 3 tháng; tập trung crypto với dự phòng 1 tháng; đa dạng có giới hạn vốn và dự phòng 2 tháng. Vì chúng khác cả cách quản lý dự phòng, không được suy ra riêng đầu tư gây ra toàn bộ chênh lệch. Các mô hình trả lời đúng xác suất 75%, bỏ qua mua sắm tự chọn. Bản 22 cho chiến thuật tập trung/đa dạng sử dụng thông tin công khai trước khi chọn ô.

Tỷ lệ dưới đây là tỷ lệ thắng theo luật điểm số, không phải đánh giá độ vui. Không đặt mục tiêu mọi chiến thuật có cùng tỷ lệ thắng. Chưa có số liệu thời lượng, cảm xúc hay khả năng hiểu luật của người dùng mới.

## Tỷ lệ thắng (%)

| Cấp | Chiến thuật | Bản 21 | Bản 22 | Bộ kiểm chứng 22 |
|---|---|---:|---:|---:|
| easy | Giữ tiền | 95.35 | 96.45 | 96.60 |
| easy | Dự phòng | 100.00 | 100.00 | 100.00 |
| easy | Tập trung crypto | 98.55 | 99.30 | 98.90 |
| easy | Đa dạng | 99.75 | 99.95 | 99.90 |
| medium | Giữ tiền | 49.95 | 55.15 | 55.15 |
| medium | Dự phòng | 98.15 | 98.90 | 98.75 |
| medium | Tập trung crypto | 52.80 | 57.15 | 57.25 |
| medium | Đa dạng | 84.20 | 88.65 | 88.95 |
| hard | Giữ tiền | 0.00 | 0.95 | 0.80 |
| hard | Dự phòng | 2.55 | 42.15 | 41.15 |
| hard | Tập trung crypto | 0.00 | 1.10 | 0.95 |
| hard | Đa dạng | 0.45 | 11.90 | 10.90 |

## Kết luận và thay đổi

- Bản 21: chỉ khoảng 60% người hoàn thành đủ năm có hai cơ hội câu hỏi; số câu phụ thuộc lượt gieo. Bản 22: mọi chặng mới còn khả năng thanh toán đến hết 12 tháng có đúng hai cơ hội; câu trả lời vẫn quyết định điểm. Không thêm điểm miễn phí.
- Mốc Khó giữ 75, vốn ban đầu và độ biến động giữ nguyên; giảm income-cut 500→300, chi tháng 1 900→500, chi định kỳ 450→250. Các chặng cũ không bị đổi mức chi. Đây là một điều chỉnh thử nghiệm nhằm tăng khả năng vượt chặng bằng quản lý vốn, không phải chứng nhận đã cân bằng hoàn hảo.
- Hai ô Cơ hội hiển thị vốn cần, khả năng bán, khoản nợ/trả góp và tiền mặt dự tính sau mua. Số liệu khớp thẻ sẽ mở; không lấy trước kết quả thị trường. Chọn ô không bắt buộc mua.
- Dự phòng tiếp tục mạnh khi mục tiêu là sống sót; tập trung crypto yếu trong stress deck thiên về cú sốc giảm. Không bắt buộc đầu tư để thắng và không biến stress deck thành dự báo lợi nhuận thực. Cần tiếp tục kiểm chứng cảm giác chơi.

## HUB — nguồn tạo và nơi tiêu

Giữ thưởng mới cho mọi chặng thắng theo yêu cầu sản phẩm. Dễ miễn phí; phần thưởng tạo HUB mới. Trung bình/Khó khóa vốn rồi hoàn khi thắng, mất khi thua. Cược duet/nhóm là chuyển HUB giữa người chơi/công quỹ, không tự tạo thưởng mới ngoài thưởng Hub độc lập.
- Bộ kiểm chứng, ưu tiên dự phòng, easy: HUB ròng trung bình +24.78/chặng (không tính 80 HUB cấp đầu).
- Bộ kiểm chứng, ưu tiên dự phòng, medium: HUB ròng trung bình +38.51/chặng (không tính 80 HUB cấp đầu).
- Bộ kiểm chứng, ưu tiên dự phòng, hard: HUB ròng trung bình -20.52/chặng (không tính 80 HUB cấp đầu).

Đây là sổ điểm giả lập có nguồn tạo không giới hạn khi chơi lại. Chưa có cơ chế cung token, giao dịch, giá hoặc thanh khoản để triển khai tiền thật. Các con số HUB/chặng không phải lợi suất đầu tư. Chặng mô phỏng độc lập giả định đã đủ điều kiện vào cấp; không dùng kỳ vọng để hứa số ván mở khóa.

## Tái lập

```sh
node scripts/simulate-balance.mjs 2000 docs/balance-v21-baseline.json 21
node scripts/simulate-balance.mjs 2000 docs/balance-v22-results.json 22
node scripts/simulate-balance.mjs 2000 docs/balance-v22-holdout.json 22 2001
```

JSON kèm khoảng Wilson 95% cho tỷ lệ thắng, chỉ thể hiện độ biến thiên theo seed trong mô hình, không chứng minh giống người chơi thật.

## Nguồn phương pháp

Lấy cảm hứng từ [Balance Check](https://github.com/Donchitos/Claude-Code-Game-Studios/blob/main/.claude/skills/balance-check/SKILL.md), [Economy Designer](https://github.com/Donchitos/Claude-Code-Game-Studios/blob/main/.claude/agents/economy-designer.md) và [Playtest Report](https://github.com/Donchitos/Claude-Code-Game-Studios/blob/main/.claude/skills/playtest-report/SKILL.md). Mã mô phỏng và triển khai là phần viết riêng cho Money Lab; chưa cài toàn bộ studio.
