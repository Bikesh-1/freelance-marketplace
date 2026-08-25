import hre from "hardhat";

const connection = await hre.network.connect();

const [walletClient] =
  await connection.viem.getWalletClients();

const address = walletClient.account.address;
const publicClient = await connection.viem.getPublicClient();

const balance =
  await publicClient.getBalance({
    address,
  });

console.log("Deployment wallet:");
console.log(address);

console.log("Balance in wei:");
console.log(balance.toString());

console.log("Balance in ETH:");
console.log(
  Number(balance) / 1e18
);