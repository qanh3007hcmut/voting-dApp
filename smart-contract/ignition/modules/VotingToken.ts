import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VotingTokenModule = buildModule("VotingTokenModule", (m) => {
  const deployer = m.getAccount(0);
  const votingToken = m.contract("VotingToken", [], { from: deployer });

  return { votingToken };
});

export default VotingTokenModule;
