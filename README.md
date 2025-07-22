# Voting Smart Contract – Sepolia Testnet

**Địa chỉ triển khai:**  
🔗 [0x3227672425b82d59655fFCcc95626601A3b1d35a (Sepolia Etherscan)](https://sepolia.etherscan.io/address/0x3227672425b82d59655fFCcc95626601A3b1d35a)

---

## 1. Mục tiêu hợp đồng

Hệ thống **Voting** được phát triển nhằm mô phỏng một hệ thống bầu cử minh bạch, an toàn và phi tập trung trên Ethereum. Hệ thống bao gồm:

- **Voting Contract**: Quản lý quá trình bỏ phiếu với thời gian cố định
- **VotingToken (ERC20)**: Token quản trị quyết định sức mạnh phiếu bầu

Các tính năng chính:

- Thêm ứng cử viên
- Mỗi địa chỉ chỉ được bỏ phiếu duy nhất 1 lần
- Sức mạnh phiếu bầu dựa trên số lượng token nắm giữ
- Hiển thị kết quả theo thời gian thực
- Tự động kết thúc bỏ phiếu theo thời gian đã định

---

## 2. Các chức năng chính

### Voting Contract

| Tính năng                  | Mô tả                                                                 | Quyền gọi        |
|---------------------------|----------------------------------------------------------------------|------------------|
| `addCandidate(string)`    | Chủ sở hữu thêm ứng cử viên vào danh sách tranh cử                  | Chỉ `owner`      |
| `vote(uint)`              | Bỏ phiếu cho ứng viên theo ID, sức mạnh phiếu dựa vào số token sở hữu | Bất kỳ (trong thời gian bỏ phiếu) |

### VotingToken (ERC20)

| Tính năng                  | Mô tả                                                                 | Quyền gọi        |
|---------------------------|----------------------------------------------------------------------|------------------|
| `mint(address, uint256)`  | Tạo thêm token cho địa chỉ chỉ định                                   | Chỉ `owner`      |
| Các chức năng ERC20 chuẩn | Chuyển token, kiểm tra số dư, phê duyệt chi tiêu...                | Bất kỳ           |


---

## 3. Logic

### Quản lý bỏ phiếu

- **Quản trị hợp đồng**: Được giới hạn bằng `onlyOwner`, chỉ chủ sở hữu có thể thêm ứng viên.
- **Thời gian bỏ phiếu**: Được xác định bằng `votingStart` và `votingEnd`, tự động kết thúc sau khoảng thời gian đã định.
- **Bảo vệ chống bỏ phiếu lại**: `voters[msg.sender]` ghi nhận địa chỉ đã bỏ phiếu → không thể bỏ phiếu lần 2.
- **Kiểm tra hợp lệ**:
  - Chỉ được bỏ phiếu trong khoảng thời gian từ `votingStart` đến `votingEnd`
  - Ứng viên phải tồn tại (theo ID hợp lệ)

### Sức mạnh phiếu bầu

- **Cơ chế tính toán**: Sức mạnh phiếu bầu dựa trên số lượng VotingToken mà người dùng nắm giữ:
  - < 1,000 token: 1 phiếu
  - 1,000 - 2,000 token: 2 phiếu
  - > 2,000 token: 3 phiếu

### Sự kiện và miêu bạch

- **Sự kiện**: Mỗi lần bỏ phiếu sẽ phát sự kiện `Vote(candidateId, voter, powerVote)` để theo dõi lịch sử on-chain.

---

## 4. Hướng dẫn sử dụng

### Các lệnh cơ bản

```bash
# Cài đặt dependencies
npm install

# Chạy tests
npm run test

# Triển khai hợp đồng lên Sepolia testnet
npm run deploy

# Xem báo cáo kết quả bỏ phiếu
npm run report
```

### Scripts

| Script | Mô tả |
|--------|-------|
| `deploy` | Triển khai cả VotingToken và Voting contract lên Sepolia |
| `test` | Chạy các test tự động |
| `report` | Hiển thị báo cáo kết quả bỏ phiếu từ các sự kiện on-chain |

### Báo cáo kết quả

Script `report.ts` sẽ đọc các sự kiện `AddCandidate` và `Vote` từ blockchain để hiển thị:

- Danh sách ứng cử viên
- Số phiếu của từng ứng viên
- Tổng số người bỏ phiếu
- Ứng viên dẫn đầu

---

**Bạn có thể kiểm tra và tương tác tại:**  
📎 [Voting Contract trên Sepolia Etherscan](https://sepolia.etherscan.io/address/0x3227672425b82d59655fFCcc95626601A3b1d35a)

---