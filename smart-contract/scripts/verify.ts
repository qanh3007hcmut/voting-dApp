import { run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  // Read contract addresses from ignition deployments
  const deploymentsPath = path.join(__dirname, "../ignition/deployments/chain-11155111/deployed_addresses.json");
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  
  const votingTokenAddress = deployments["VotingTokenModule#VotingToken"];
  const votingAddress = deployments["VotingModule#Voting"];
  
  console.log("Verifying contracts on Etherscan...");
  
  // Read the deployment artifacts to get constructor arguments
  const artifactsPath = path.join(__dirname, "../ignition/deployments/chain-11155111/journal.jsonl");
  const journalData = fs.readFileSync(artifactsPath, "utf8").split("\n")
    .filter(line => line.trim() !== "")
    .map(line => JSON.parse(line));
  
  // Find VotingToken deployment
  console.log("Verifying VotingToken at:", votingTokenAddress);
  try {
    await run("verify:verify", {
      address: votingTokenAddress,
      constructorArguments: []
    });
    console.log("VotingToken verified successfully");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("VotingToken already verified");
    } else {
      console.error("Error verifying VotingToken:", error);
    }
  }
  
  // Find Voting deployment and its constructor args
  const votingDeployment = journalData.find(
  entry =>
    entry.type === "DEPLOYMENT_EXECUTION_STATE_INITIALIZE" &&
    entry.artifactId === "VotingModule#Voting"
);
  
  if (votingDeployment) {
    const args = votingDeployment?.constructorArgs ?? [];

    console.log("Verifying Voting at:", votingAddress);
    console.log("Constructor args:", args);
    
    try {
      await run("verify:verify", {
        address: votingAddress,
        constructorArguments: args
      });
      console.log("Voting contract verified successfully");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("Voting contract already verified");
      } else {
        console.error("Error verifying Voting contract:", error);
      }
    }
  } else {
    console.error("Could not find Voting deployment in journal");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});