import { expect } from "chai";
import { ethers } from "hardhat";
import { Voting, VotingToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Voting Contract", function () {
  let votingToken: VotingToken;
  let voting: Voting;
  let owner: SignerWithAddress;
  let voter1: SignerWithAddress;
  let voter2: SignerWithAddress;
  let voter3: SignerWithAddress;
  const votingDuration = 7 * 24 * 60 * 60; // 7 days in seconds

  beforeEach(async function () {
    // Get signers
    [owner, voter1, voter2, voter3] = await ethers.getSigners();

    // Deploy VotingToken
    const VotingTokenFactory = await ethers.getContractFactory("VotingToken");
    votingToken = await VotingTokenFactory.deploy();

    // Deploy Voting contract with VotingToken address and duration
    const VotingFactory = await ethers.getContractFactory("Voting");
    voting = await VotingFactory.deploy(await votingToken.getAddress(), votingDuration);

    // Add candidates
    await voting.addCandidate("Candidate 1");
    await voting.addCandidate("Candidate 2");
    
    // Distribute tokens to voters
    await votingToken.transfer(voter1.address, ethers.parseEther("500"));  // 1 vote power
    await votingToken.transfer(voter2.address, ethers.parseEther("1500")); // 2 vote power
    await votingToken.transfer(voter3.address, ethers.parseEther("3000")); // 3 vote power
  });

  it("Should deploy with correct initial state", async function () {
    expect(await voting.owner()).to.equal(owner.address);
    
    const votingStart = await voting.votingStart();
    const votingEnd = await voting.votingEnd();
    
    expect(votingEnd - votingStart).to.equal(votingDuration);
    expect(await voting.candidatesCount()).to.equal(2);
    expect(await voting.votingToken()).to.equal(await votingToken.getAddress());
  });

  it("Should allow adding candidates by owner", async function () {
    await voting.addCandidate("Candidate 3");
    expect(await voting.candidatesCount()).to.equal(3);
    
    const candidates = await voting.viewCandidateList();
    expect(candidates.length).to.equal(3);
    expect(candidates[2].name).to.equal("Candidate 3");
  });

  it("Should not allow non-owners to add candidates", async function () {
    await expect(
      voting.connect(voter1).addCandidate("Unauthorized Candidate")
    ).to.be.revertedWith("Only owner can add candidates");
  });

  it("Should allow voting with correct power based on token balance", async function () {
    // Voter1 votes for Candidate 1 (power = 1)
    await voting.connect(voter1).vote(1);
    
    // Voter2 votes for Candidate 1 (power = 2)
    await voting.connect(voter2).vote(1);
    
    // Voter3 votes for Candidate 2 (power = 3)
    await voting.connect(voter3).vote(2);
    
    const candidates = await voting.viewCandidateList();
    expect(candidates[0].voteCount).to.equal(3); // 1 + 2
    expect(candidates[1].voteCount).to.equal(3); // 3
  });

  it("Should not allow voting twice", async function () {
    await voting.connect(voter1).vote(1);
    await expect(
      voting.connect(voter1).vote(2)
    ).to.be.revertedWith("You have already voted");
  });

  it("Should correctly identify the most voted candidate", async function () {
    await voting.connect(voter1).vote(1); // +1 for Candidate 1
    await voting.connect(voter2).vote(2); // +2 for Candidate 2
    
    let mostVoted = await voting.showMostVotedCandidate();
    expect(mostVoted.id).to.equal(2);
    
    // Now make Candidate 1 have more votes
    await voting.connect(voter3).vote(1); // +3 for Candidate 1
    
    mostVoted = await voting.showMostVotedCandidate();
    expect(mostVoted.id).to.equal(1); // Candidate 1 now has 4 votes vs 2 votes
  });

  it("Should not allow voting for non-existent candidates", async function () {
    // Try to vote for candidate with ID 0 (doesn't exist)
    await expect(
      voting.connect(voter1).vote(0)
    ).to.be.revertedWith("Invalid candidate");

    // Try to vote for candidate with ID greater than candidatesCount
    await expect(
      voting.connect(voter1).vote(3)
    ).to.be.revertedWith("Invalid candidate");
  });

  it("Should not allow voting when voting period has ended", async function () {
    // Fast forward time to after voting period
    await time.increase(votingDuration + 1);
    
    // Try to vote after voting has ended
    await expect(
      voting.connect(voter1).vote(1)
    ).to.be.revertedWith("Voting has ended");
  });
});