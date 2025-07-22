import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { Voting__factory } from "../typechain-types";

async function main() {
  // Read contract address from ignition deployments
  const deploymentsPath = path.join(
    __dirname,
    "../ignition/deployments/chain-11155111/deployed_addresses.json"
  );
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const contractAddress = deployments["VotingModule#Voting"];

  const signers = await ethers.getSigners();
  const deployer = signers[0];

  // Connect to the contract
  const voting = Voting__factory.connect(contractAddress, deployer);

  console.log("Voting Report");
  console.log("=============");
  console.log(`Contract Address: ${contractAddress}`);

  // Get voting period
  const votingStart = await voting.votingStart();
  const votingEnd = await voting.votingEnd();
  const currentTime = Math.floor(Date.now() / 1000);

  console.log(
    `\nVoting Period: ${new Date(
      Number(votingStart) * 1000
    ).toLocaleString()} to ${new Date(
      Number(votingEnd) * 1000
    ).toLocaleString()}`
  );
  console.log(
    `Status: ${
      currentTime < votingStart
        ? "Not Started"
        : currentTime > votingEnd
        ? "Ended"
        : "Active"
    }`
  );

  // Get candidate count
  const candidatesCount = await voting.candidatesCount();
  console.log(`\nTotal Candidates: ${candidatesCount}`);

  // Get all AddCandidate events
  const addCandidateFilter = voting.filters.AddCandidate();
  const addCandidateEvents = await voting.queryFilter(addCandidateFilter);

  // Create a map of candidates
  const candidates: { [id: string]: { name: string; votes: number } } = {};

  for (const event of addCandidateEvents) {
    const { candidateId, name } = event.args as unknown as {
      candidateId: bigint;
      name: string;
    };
    candidates[candidateId.toString()] = { name, votes: 0 };
  }

  // Get all Vote events
  const voteFilter = voting.filters.Vote();
  const voteEvents = await voting.queryFilter(voteFilter);

  // Count votes
  const voters = new Set<string>();

  for (const event of voteEvents) {
    const { candidateId, voter, powerVote } = event.args as unknown as {
      candidateId: bigint;
      voter: string;
      powerVote: bigint;
    };

    const id = candidateId.toString();
    if (candidates[id]) {
      candidates[id].votes += Number(powerVote);
      voters.add(voter);
    }
  }

  // Display vote results
  console.log("\nVoting Results:");
  console.log("--------------");

  const sortedCandidates = Object.entries(candidates).sort(
    (a, b) => b[1].votes - a[1].votes
  );

  for (const [id, { name, votes }] of sortedCandidates) {
    console.log(`${name}: ${votes} votes`);
    if (id === "3") break;
  }

  console.log(`\nTotal Voters: ${voters.size}`);
  console.log(`Total Votes: ${voteEvents.length}`);

  // Find winner
  if (sortedCandidates.length > 0) {
    const winner = sortedCandidates[0];
    console.log(
      `\nCurrent Leader: ${winner[1].name} with ${winner[1].votes} votes`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
