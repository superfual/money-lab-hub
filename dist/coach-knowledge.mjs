export const knowledge = [
  {
    "id": "start",
    "viq": "Bắt đầu chơi thế nào?",
    "enq": "How do I start?",
    "tags": "bat dau choi huong dan gieo xuc xac start play roll dice tutorial",
    "vi": "World 1 mô phỏng 12 tháng quản lý tiền. Chọn mức Dễ, xem tiền mặt, dự phòng và nghĩa vụ rồi bắt đầu. Sau khi gieo xúc xắc, chọn một trong hai ô và xử lý tình huống. Các số tiền là giả lập.",
    "en": "World 1 simulates twelve months of money management. Start on Easy, review cash, reserves and obligations, then roll. Choose one of two destinations and resolve the event. Financial amounts are simulated.",
    "source": "./rules.html"
  },
  {
    "id": "timer",
    "viq": "Đồng hồ tính từ lúc nào?",
    "enq": "When does the timer start?",
    "tags": "dong ho thoi gian het gio 60 giay timer timeout seconds countdown",
    "vi": "Bạn có thể đọc tài chính trước khi gieo mà không bị tính giờ. Một lượt có 60 giây từ khi gieo thành công, bao gồm chọn ô và xử lý tình huống. Hết giờ: bỏ lựa chọn và thu nhập tự nguyện; lương thường kỳ, chi phí bắt buộc và biến động danh mục vẫn áp dụng. Tải lại trang không đặt lại giờ.",
    "en": "You can review finances before rolling without a deadline. A successful roll starts one 60-second window covering route selection and the event. Timeout declines voluntary choices and optional income; regular salary, mandatory costs and portfolio changes still apply. Reloading does not reset the clock.",
    "source": "./rules.html"
  },
  {
    "id": "hub",
    "viq": "HUB có phải tiền thật không?",
    "enq": "Is HUB real money?",
    "tags": "hub token tien that mua ban chuyen nhuong rut tien free points real money transfer purchase withdraw",
    "vi": "HUB hiện là điểm trong game. Bản mainnet công khai cấp 80 HUB miễn phí một lần cho mỗi ví; không mua bán, chuyển nhượng hay rút thành tiền. HUB và tiến độ của game giả lập, testnet, mainnet nhà sáng lập và mainnet công khai tách biệt. Giao dịch mainnet có phí gas bằng OKB thật.",
    "en": "HUB is an in-game point. Public mainnet grants 80 free HUB once per wallet; it cannot be traded, transferred or withdrawn for money. Guest simulation, testnet, founder mainnet and public mainnet have separate balances and progress. Mainnet transactions cost real OKB gas.",
    "source": "./mainnet-play.html"
  },
  {
    "id": "tapeout",
    "viq": "TapeOut đóng góp gì?",
    "enq": "What does TapeOut do?",
    "tags": "tapeout tapout circuit mach 48 49 ref r c d stop gate verify logic",
    "vi": "TapeOut cung cấp mạch logic có thể đối chiếu. Mạch #48 hỗ trợ STOP gate chặn đầu tư; mạch REF #49 kết hợp các điều kiện R/C/D về dự phòng, nghĩa vụ và trả góp. Money Lab tính đầu vào từ tài chính giả lập. Mạch không xác thực tài sản ngoài đời; quyết toán HUB vẫn dựa trên kết quả có chữ ký máy chủ, không phải toàn bộ game được circuit xác minh.",
    "en": "TapeOut supplies checkable circuit logic. Circuit #48 supports the investment STOP gate; REF circuit #49 combines R/C/D checks for reserves, obligations and installments. Money Lab calculates inputs from simulated finances. Circuits do not authenticate real-world assets. HUB settlement still checks server-signed outcomes; the full game is not circuit-verified.",
    "source": "./risk-lab.html"
  },
  {
    "id": "replay",
    "viq": "Replay có đổi kết quả cũ không?",
    "enq": "Does Replay change my result?",
    "tags": "replay xem lai quyet dinh hat giong seeds original reward compare decision",
    "vi": "Replay cho phép thay một lựa chọn đã ghi và so sánh với cùng các hạt giống sự kiện đã lưu. Nó không sửa chặng gốc và không thưởng thêm HUB. Cùng seed giúp so sánh quyết định; điều đó không tự chứng minh nguồn ngẫu nhiên là công bằng.",
    "en": "Replay changes a recorded choice and compares consequences using the same recorded event seeds. It does not change the original stage or grant extra HUB. Shared seeds support comparison, but do not by themselves prove fair randomness.",
    "source": "./decision-lab.html"
  },
  {
    "id": "cash",
    "viq": "Tiền mặt khác tài sản ròng thế nào?",
    "enq": "How do cash and net worth differ?",
    "tags": "tien mat tai san rong thanh khoan du phong dong tien cash reserve net worth liquidity finance portfolio",
    "vi": "Tài sản ròng gồm tiền, dự phòng, giá trị đầu tư trừ nợ. Giá trị danh mục không có nghĩa là tiền có thể dùng ngay: tài sản khóa vốn có thể chưa bán được. Trước khi đầu tư, xem dòng tiền tháng tới, khoản trả góp và tiền còn sau nghĩa vụ; lợi nhuận trên giấy không thanh toán được hóa đơn.",
    "en": "Net worth includes cash, reserves and investments minus debt. Portfolio value is not necessarily spendable cash: locked investments may be unsellable. Before investing, review next-month cash flow, installments and remaining liquidity. Paper gains cannot pay bills.",
    "source": "./"
  },
  {
    "id": "blocked",
    "viq": "Tại sao không đầu tư được?",
    "enq": "Why is investing blocked?",
    "tags": "khong dau tu duoc bi chan khong du tien blocked cannot invest insufficient buy disabled",
    "vi": "Các nguyên nhân có thể gồm thiếu tiền mặt, STOP gate chưa cho phép, hoặc trạng thái kết nối/đối chiếu chưa sẵn sàng. Hãy xem thông báo cạnh lựa chọn và mở phần TapeOut để kiểm tra. Coach bản này chưa đọc chặng của bạn nên không kết luận nguyên nhân cụ thể.",
    "en": "Possible reasons include insufficient cash, a blocking STOP gate, or connection/verification not being ready. Read the message beside the choice and inspect the TapeOut panel. This version of Coach cannot read your session, so it cannot determine your specific cause.",
    "source": "./risk-lab.html"
  },
  {
    "id": "worlds",
    "viq": "World 2 và 3 hoạt động thế nào?",
    "enq": "What are Worlds 2 and 3?",
    "tags": "world 2 3 the gioi dat resort khach san hotel land tourism 1000 10000",
    "vi": "World 2 và 3 là các phiên bản đầu có thể chơi của mô hình đầu tư du lịch. World 2: 25 ô, 3–6 người, mỗi người cần trên 1.000 HUB máy chủ. World 3: 36 ô, 4–6 người, ít nhất 10.000 HUB. Quy trình dự án gồm mua đất, góp vốn xây và hoàn công. Điều kiện vào hiện không tiêu HUB; mua token thật và thưởng HUB cho hai World này chưa triển khai.",
    "en": "Worlds 2 and 3 are early playable tourism-investment prototypes. World 2 has 25 spaces, 3–6 players and requires over 1,000 server HUB per player. World 3 has 36 spaces, 4–6 players and requires at least 10,000. Projects progress through land, construction and completion. Entry currently does not spend HUB; real-token purchases and HUB rewards for these worlds are not implemented.",
    "source": "./world.html?world=2"
  },
  {
    "id": "multiplayer",
    "viq": "Chơi Duet và Group ở đâu?",
    "enq": "Where can I play Duet or Group?",
    "tags": "duet group nhom phong ban be multiplayer room friends online level cap do",
    "vi": "Mở Duet / Group online để tạo hoặc vào phòng trên các thiết bị khác nhau. Nhóm chỉ lên cấp cao hơn khi mọi thành viên đều đủ điều kiện; nếu chưa đủ thì tiếp tục cấp hiện tại. Public Mainnet hiện dành cho World 1 Solo, không phải mainnet nhiều người.",
    "en": "Open Duet / Group online to create or join a cross-device room. The room can advance only when every member qualifies; otherwise keep the current level. Public Mainnet currently supports World 1 Solo, not mainnet multiplayer.",
    "source": "./online.html"
  },
  {
    "id": "settlement",
    "viq": "Hoàn thành chặng đã là quyết toán chưa?",
    "enq": "Is a finished stage already settled?",
    "tags": "quyet toan giao dich lich su tx hash settlement receipt transaction finish onchain confirm",
    "vi": "Nhật ký hoàn thành trên máy chủ chưa chứng minh quyết toán onchain. Dùng nút đối chiếu kết toán của chặng và kiểm tra biên nhận giao dịch thành công trên đúng mạng, đúng hợp đồng. Coach không kiểm tra giao dịch trực tiếp và không thể xác nhận một chặng chỉ từ lời nhắn.",
    "en": "A completed server log does not prove onchain settlement. Use the stage settlement-check button and verify a successful transaction receipt on the correct network and contract. Coach does not perform live transaction checks and cannot confirm settlement from a chat message alone.",
    "source": "./verify-result.html"
  },
  {
    "id": "privacy",
    "viq": "Có xóa được lịch sử không?",
    "enq": "Can I delete history?",
    "tags": "xoa lich su rieng tu du lieu seed private key password delete history privacy wallet",
    "vi": "Bạn có thể dùng các mục lịch sử và quyền riêng tư để quản lý dữ liệu máy chủ theo chức năng hiện có. Địa chỉ ví và dữ liệu đã ghi lên blockchain công khai không thể xóa bằng nút xóa nhật ký. Không gửi seed phrase, khóa riêng hoặc mật khẩu vào Coach; hội thoại này chỉ ở bộ nhớ tab và mất khi tải lại.",
    "en": "Use the history and privacy controls to manage server records where supported. Public blockchain addresses and records cannot be erased by deleting server logs. Never send seed phrases, private keys or passwords to Coach. This chat stays in tab memory and disappears on reload.",
    "source": "./"
  },
  {
    "id": "mainnet",
    "viq": "Chơi mainnet cần gì?",
    "enq": "What do I need for mainnet?",
    "tags": "mainnet x layer okb gas vi wallet connect faucet testnet network 196",
    "vi": "Dùng trang Mainnet công khai, đăng nhập và kết nối ví trên X Layer mainnet (196). HUB miễn phí nhưng phí gas giao dịch dùng OKB thật. Testnet là môi trường khác, không gửi OKB thật sang đó chỉ để thử. Luôn đọc mạng, giá trị và phí trong ví trước khi tự xác nhận; Coach không ký hay gửi giao dịch.",
    "en": "Use Public Mainnet, sign in and connect a wallet on X Layer mainnet (196). HUB is free, but transactions use real OKB for gas. Testnet is separate: do not send real OKB there just to experiment. Review network, value and fees in your wallet before confirming yourself. Coach never signs or sends transactions.",
    "source": "./mainnet-play.html"
  }
];
