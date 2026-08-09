import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();

  const [deployer] =
    await viem.getWalletClients();

  console.log(
    "Deploying from:",
    deployer.account.address
  );

  const escrow =
    await viem.deployContract(
      "FreelanceEscrow",
      [deployer.account.address]
    );

  console.log(
    "FreelanceEscrow deployed at:",
    escrow.address
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});