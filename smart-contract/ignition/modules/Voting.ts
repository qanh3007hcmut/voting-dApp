import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import VotingTokenModule from "./VotingToken";

const VotingModule = buildModule("VotingModule", (m) => {
  const deployer = m.getAccount(0);
  
  // Import VotingToken from its module
  const { votingToken } = m.useModule(VotingTokenModule);
  
  // Set voting duration to 7 days (in seconds)
  const votingDuration = 7 * 24 * 60 * 60; // 7 days in seconds
  
  // Deploy Voting with VotingToken address and duration
  const voting = m.contract("Voting", [votingToken, votingDuration], { from: deployer });

  return { voting, votingToken };
});

export default VotingModule;
