// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Voting {
    using SafeERC20 for IERC20;

    uint256 public votingStart;
    uint256 public votingEnd;
    address public owner;
    uint256 public candidatesCount;
    IERC20 public votingToken;

    mapping(address => uint256) private voted;

    event Vote(
        uint256 indexed candidateId,
        address indexed voter,
        uint256 powerVote
    );

    event AddCandidate(uint256 indexed candidateId, string name);

    constructor(address TokenAddress, uint256 start, uint256 end) {
        require(TokenAddress != address(0), "Invalid token address");
        votingToken = IERC20(TokenAddress);
        owner = msg.sender;
        votingStart = start;
        votingEnd = end;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can add candidates");
        _;
    }

    modifier validVoter() {
        require(voted[msg.sender] > 0, "You have already voted");
        _;
    }

    modifier votingOpen() {
        require(block.timestamp >= votingStart, "Voting has not started yet");
        require(block.timestamp <= votingEnd, "Voting has ended");
        _;
    }

    function setTimeStart(uint256 start) external onlyOwner {
        votingStart = start;
    }

    function setTimeEnd(uint256 end) external onlyOwner {
        votingEnd = end;
    }

    function addCandidate(string memory _name) external onlyOwner {
        candidatesCount++;
        emit AddCandidate(candidatesCount, _name);
    }

    function vote(uint256 _candidateId) external validVoter votingOpen {
        require(
            _candidateId > 0 && _candidateId <= candidatesCount,
            "Invalid candidate"
        );
        uint256 power = getPowerVote();
        voted[msg.sender] = power;
        emit Vote(_candidateId, msg.sender, power);
    }

    function getPowerVote() internal view returns (uint256) {
        uint256 balance = votingToken.balanceOf(msg.sender);
        if (balance < 1000 * 10 ** 18) {
            return 1;
        } else if (balance <= 2000 * 10 ** 18) {
            return 2;
        } else {
            return 3;
        }
    }
}
