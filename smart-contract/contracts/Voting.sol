// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    // Structure for a candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }
    bool public votingActive = true;
    // Owner of the contract
    address public owner;
    
    // Store candidates
    mapping(uint => Candidate) public candidates;
    
    // Store voters
    mapping(address => bool) public voters;
    
    // Candidates count
    uint public candidatesCount;
    
    // Event triggered when a vote is cast
    event VotedEvent(uint indexed candidateId, address indexed voter);

    // Constructor
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner {
        require(msg.sender == owner, "Only owner can add candidates");
        _;
    }

    modifier validVoter {
        require(!voters[msg.sender], "You have already voted");
        _;
    }

    modifier votingOpen {
        require(votingActive, "No candidates available for voting");
        _;
    }

    // Add a candidate
    function addCandidate(string memory _name) public onlyOwner {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }
    
    // Cast a vote
    function vote(uint _candidateId) public validVoter votingOpen{        
        // Require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate");
        
        // Record that voter has voted
        voters[msg.sender] = true;
        
        // Update candidate vote count
        candidates[_candidateId].voteCount++;
        
        // Trigger voted event
        emit VotedEvent(_candidateId, msg.sender);
    }

    function viewCandidateList() public view returns (Candidate[] memory) {
        Candidate[] memory candidateList = new Candidate[](candidatesCount);
        for (uint i = 1; i <= candidatesCount; i++) {
            candidateList[i - 1] = candidates[i];
        }
        return candidateList;
    }

    function showMostVotedCandidate() public view returns (Candidate memory) {
        Candidate memory mostVoted;
        for (uint i = 1; i <= candidatesCount; i++) {
            if (candidates[i].voteCount > mostVoted.voteCount) {
                mostVoted = candidates[i];
            }
        }
        return mostVoted;
    }

    function endVoting() public onlyOwner {
        votingActive = false;
    }
}