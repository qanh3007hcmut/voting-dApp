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
  const start = Math.floor(Date.now() / 1000);
  const end = start + 7 * 24 * 60 * 60; // 7 days in seconds

  beforeEach(async function () {
    // Get signers
    [owner, voter1, voter2, voter3] = await ethers.getSigners();

    // Deploy VotingToken
    const VotingTokenFactory = await ethers.getContractFactory("VotingToken");
    votingToken = await VotingTokenFactory.deploy();

    // Deploy Voting contract with VotingToken address and duration
    const VotingFactory = await ethers.getContractFactory("Voting");
    voting = await VotingFactory.deploy(
      await votingToken.getAddress(),
      start,
      end
    );

    // Add candidates
    await voting.addCandidate("Candidate 1");
    await voting.addCandidate("Candidate 2");

    // Distribute tokens to voters
    await votingToken.transfer(voter1.address, ethers.parseEther("500")); // 1 vote power
    await votingToken.transfer(voter2.address, ethers.parseEther("1500")); // 2 vote power
    await votingToken.transfer(voter3.address, ethers.parseEther("3000")); // 3 vote power
  });

  it("Should deploy with correct initial state", async function () {
    expect(await voting.owner()).to.equal(owner.address);

    const votingStart = await voting.votingStart();
    const votingEnd = await voting.votingEnd();

    expect(votingEnd - votingStart).to.equal(7 * 24 * 60 * 60);
    expect(await voting.candidatesCount()).to.equal(2);
    expect(await voting.votingToken()).to.equal(await votingToken.getAddress());
  });

  it("Should allow adding candidates by owner", async function () {
    await voting.addCandidate("Candidate 3");
    expect(await voting.candidatesCount()).to.equal(3);
  });

  it("Should not allow non-owners to add candidates", async function () {
    await expect(
      voting.connect(voter1).addCandidate("Unauthorized Candidate")
    ).to.be.revertedWith("Only owner can add candidates");
  });

  it("Should emit true event adding candidates", async function () {
    await expect(voting.connect(owner).addCandidate("1st Candidate"))
      .to.emit(voting, "AddCandidate")
      .withArgs(3, "1st Candidate");

    await expect(voting.connect(owner).addCandidate("2st Candidate"))
      .to.emit(voting, "AddCandidate")
      .withArgs(4, "2st Candidate");
  });

  it("Should emit VotedEvent with correct parameters", async function () {
    // Voter1 votes for Candidate 1 (power = 1)
    await expect(voting.connect(voter1).vote(1))
      .to.emit(voting, "Vote")
      .withArgs(1, voter1.address, 1);

    // Voter2 votes for Candidate 1 (power = 2)
    await expect(voting.connect(voter2).vote(1))
      .to.emit(voting, "Vote")
      .withArgs(1, voter2.address, 2);

    // Voter3 votes for Candidate 2 (power = 3)
    await expect(voting.connect(voter3).vote(2))
      .to.emit(voting, "Vote")
      .withArgs(2, voter3.address, 3);
  });

  it("Should not allow voting twice", async function () {
    await voting.connect(voter1).vote(1);
    await expect(voting.connect(voter1).vote(2)).to.be.revertedWith(
      "You have already voted"
    );
  });

  it("Should not allow voting for non-existent candidates", async function () {
    // Try to vote for candidate with ID 0 (doesn't exist)
    await expect(voting.connect(voter1).vote(0)).to.be.revertedWith(
      "Invalid candidate"
    );

    // Try to vote for candidate with ID greater than candidatesCount
    await expect(voting.connect(voter1).vote(3)).to.be.revertedWith(
      "Invalid candidate"
    );
  });

  it("Should not allow voting when voting period has ended", async function () {
    // Fast forward time to after voting period
    await time.increase(7 * 24 * 60 * 60 * 2);

    // Try to vote after voting has ended
    await expect(voting.connect(voter1).vote(1)).to.be.revertedWith(
      "Voting has ended"
    );
  });

  it("Should not allow voting when voting period hasn't started", async function () {
    await voting.setTimeStart(end * 2); // Set start time in the future
    // Try to vote after voting has ended
    await expect(voting.connect(voter1).vote(1)).to.be.revertedWith(
      "Voting has not started yet"
    );
  });
});
