// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Voting {
    using SafeERC20 for IERC20;
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct Voter {
        uint256 timestamp;
        uint8 powerVote;
    }

    uint256 public votingStart;
    uint256 public votingEnd;
    address public owner;
    uint public candidatesCount;
    IERC20 public votingToken;
    mapping(uint => Candidate) private candidates;
    mapping(address => Voter) private voters;

    event VotedEvent(
        uint indexed candidateId,
        address indexed voter,
        uint8 powerVote
    );

    constructor(address TokenAddress, uint256 _duration) {
        require(TokenAddress != address(0), "Invalid token address");
        votingToken = IERC20(TokenAddress);
        owner = msg.sender;
        votingStart = block.timestamp;
        votingEnd = votingStart + _duration;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can add candidates");
        _;
    }

    modifier validVoter() {
        require(voters[msg.sender].timestamp == 0, "You have already voted");
        _;
    }

    modifier votingOpen() {
        require(block.timestamp >= votingStart, "Voting has not started yet");
        require(block.timestamp <= votingEnd, "Voting has ended");
        _;
    }

    function addCandidate(string memory _name) external onlyOwner {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote(uint _candidateId) external validVoter votingOpen {
        require(
            _candidateId > 0 && _candidateId <= candidatesCount,
            "Invalid candidate"
        );
        voters[msg.sender].timestamp = block.timestamp;
        uint8 powerVote = getPowerVote();
        voters[msg.sender].powerVote = powerVote;
        candidates[_candidateId].voteCount += powerVote;
        emit VotedEvent(_candidateId, msg.sender, powerVote);
    }

    function viewCandidateList() external view returns (Candidate[] memory) {
        Candidate[] memory candidateList = new Candidate[](candidatesCount);
        for (uint i = 1; i <= candidatesCount; i++) {
            candidateList[i - 1] = candidates[i];
        }
        return candidateList;
    }

    function showMostVotedCandidate() external view returns (Candidate memory) {
        Candidate memory mostVoted;
        for (uint i = 1; i <= candidatesCount; i++) {
            if (candidates[i].voteCount > mostVoted.voteCount) {
                mostVoted = candidates[i];
            }
        }
        return mostVoted;
    }

    function getPowerVote() public view returns (uint8) {
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
