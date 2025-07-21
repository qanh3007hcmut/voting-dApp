# Voting Smart Contract – Sepolia Testnet

**Địa chỉ triển khai:**  
🔗 [0xE445EB07a5E4739a64951dC5bA06F75Ef1e22352 (Sepolia Etherscan)](https://sepolia.etherscan.io/address/0x0E72ca0578B164E134701935Ff97D474ED81ABD7)

---

## 1. Mục tiêu hợp đồng

Hợp đồng **Voting** được phát triển nhằm mô phỏng một hệ thống bầu cử minh bạch, an toàn và phi tập trung trên Ethereum. Nó cho phép:

- Thêm ứng cử viên
- Mỗi địa chỉ chỉ được bỏ phiếu duy nhất 1 lần
- Hiển thị kết quả theo thời gian thực
- Kết thúc quá trình bỏ phiếu theo quyền quản trị

---

## 2. Các chức năng chính

| Tính năng                  | Mô tả                                                                 | Quyền gọi        |
|---------------------------|----------------------------------------------------------------------|------------------|
| `addCandidate(string)`    | Chủ sở hữu thêm ứng cử viên vào danh sách tranh cử                  | Chỉ `owner`      |
| `vote(uint)`              | Bỏ phiếu cho ứng viên theo ID, mỗi địa chỉ chỉ được bỏ 1 phiếu      | Bất kỳ           |
| `viewCandidateList()`     | Trả về danh sách đầy đủ các ứng cử viên hiện có                      | Bất kỳ           |
| `showMostVotedCandidate()`| Trả về ứng cử viên đang dẫn đầu về số phiếu                         | Bất kỳ           |
| `endVoting()`             | Kết thúc cuộc bầu cử, không còn cho phép bỏ phiếu                   | Chỉ `owner`      |


---

## 3. Logic

- **Quản trị hợp đồng**: Được giới hạn bằng `onlyOwner`, chỉ chủ sở hữu có thể thêm ứng viên hoặc kết thúc bầu cử.
- **Bảo vệ chống bỏ phiếu lại**: `voters[msg.sender]` ghi nhận địa chỉ đã bỏ phiếu → không thể bỏ phiếu lần 2.
- **Kiểm tra hợp lệ**:
  - Chỉ được bỏ phiếu nếu `votingActive = true`
  - Ứng viên phải tồn tại (theo ID hợp lệ)
- **Sự kiện**: Mỗi lần bỏ phiếu sẽ phát sự kiện `VotedEvent(candidateId)` để theo dõi lịch sử on-chain.

---

## 4. Giới hạn
- Không thể sửa hoặc xóa ứng cử viên sau khi thêm
- Không hỗ trợ nhiều vòng bầu cử hoặc phân nhóm cử tri
- Không mã hóa danh tính cử tri (không ẩn danh)

---

**Bạn có thể kiểm tra và tương tác tại:**  
📎 [Voting Contract trên Sepolia Etherscan](https://sepolia.etherscan.io/address/0x0E72ca0578B164E134701935Ff97D474ED81ABD7)

---
