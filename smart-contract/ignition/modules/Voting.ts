import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VotingModule = buildModule("VotingModule", (m) => {
  const deployer = m.getAccount(0);
  const voting = m.contract("Voting", [], { from: deployer });

  return { voting };
});

export default VotingModule;
