import hre from "hardhat";

const connection = await hre.network.connect();

const publicClient = await connection.viem.getPublicClient();

const address =
  "0x5fbdb2315678afecb367f032d93f642f64180aa3";

const code = await publicClient.getCode({
  address,
});

console.log("Contract address:");
console.log(address);

console.log("Contract bytecode:");
console.log(code);

console.log("Contract exists:");
console.log(code !== undefined && code !== "0x");