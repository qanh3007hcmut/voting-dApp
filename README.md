# Voting Smart Contract – Sepolia Testnet

**Địa chỉ triển khai:**  
🔗 [0xF7de17641f1C02Fcb2D9F92e70B1205d354B5EA3 (Sepolia Etherscan)](https://sepolia.etherscan.io/address/0xF7de17641f1C02Fcb2D9F92e70B1205d354B5EA3)

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
| `viewCandidateList()`     | Trả về danh sách đầy đủ các ứng cử viên hiện có                      | Bất kỳ           |
| `showMostVotedCandidate()`| Trả về ứng cử viên đang dẫn đầu về số phiếu                         | Bất kỳ           |
| `getPowerVote()`          | Tính toán sức mạnh phiếu bầu dựa trên số lượng token                   | Bất kỳ           |

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

- **Sự kiện**: Mỗi lần bỏ phiếu sẽ phát sự kiện `VotedEvent(candidateId, voter, powerVote)` để theo dõi lịch sử on-chain.

---

**Bạn có thể kiểm tra và tương tác tại:**  
📎 [Voting Contract trên Sepolia Etherscan](https://sepolia.etherscan.io/address/0xF7de17641f1C02Fcb2D9F92e70B1205d354B5EA3)

---
