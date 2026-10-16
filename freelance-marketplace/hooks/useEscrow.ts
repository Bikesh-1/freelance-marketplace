// "use client";

// import { useState } from "react";
// import { ethers } from "ethers";
// import axios from "axios";
// import {getBrowserProvider,switchToHardhatLocal,} from "@/lib/blockchain/provider";
// import { getEscrowContract } from "@/lib/blockchain/escrow";

// export function useEscrow() {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const createEscrow = async (freelancerAddress: string,jobId: string = "") => {
//     try {
//       setLoading(true);
//       setError(null);

//       if (!ethers.isAddress(freelancerAddress)) {
//         throw new Error("Invalid freelancer wallet address");
//       }

//       const provider = getBrowserProvider();
//       const accounts = await provider.send("eth_accounts", []);

//       if (!accounts || accounts.length === 0) {
//         throw new Error("Please connect MetaMask first");
//       }

//       const signer = await provider.getSigner();
//       const contract = getEscrowContract(signer);
//       const tx = await contract.createEscrow(freelancerAddress);

//       const receipt = await tx.wait();

//       if (!receipt) {
//         throw new Error(
//           "Escrow creation transaction failed"
//         );
//       }

//       if (jobId) {
//         await axios.post("/api/escrow/create", {
//           jobId,
//           contractAddress:process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS,
//           amount: 0,
//         });
//       }

//       return receipt;
//     } catch (err: unknown) {
//       console.error("Create escrow error:", err);

//       const errorObj = err as {
//         shortMessage?: string;
//         reason?: string;
//         message?: string;
//       };

//       const message =
//         errorObj.shortMessage ||
//         errorObj.reason ||
//         errorObj.message ||
//         "Transaction failed";

//       setError(message);

//       throw new Error(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fundEscrow = async (
//     escrowId: number,
//     amount: string,
//     prismaEscrowId: string = ""
//   ) => {
//     try {
//       setLoading(true);
//       setError(null);

//       if (!Number.isInteger(escrowId) ||escrowId < 0) {
//         throw new Error("Invalid blockchain escrow ID");
//       }

//       if (!amount || Number(amount) <= 0) {
//         throw new Error("Invalid escrow amount");
//       }

//       const provider = getBrowserProvider();

//       const accounts = await provider.send("eth_accounts",[]);

//       if (!accounts || accounts.length === 0) {
//         throw new Error("Please connect MetaMask first");
//       }

//       const signer = await provider.getSigner();
//       const signerAddress = await signer.getAddress();

//       const contract = getEscrowContract(signer);

//       const escrow = await contract.getEscrow(escrowId);
      

//       const clientAddress = escrow[0];
//       const freelancerAddress = escrow[1];
//       const blockchainAmount = escrow[2];
//       const status = Number(escrow[3]);

//       console.log("Escrow before funding:", {
//         escrowId,
//         clientAddress,
//         freelancerAddress,
//         blockchainAmount:
//           ethers.formatEther(blockchainAmount),
//         status,
//         signerAddress,
//       });

//       if (clientAddress.toLowerCase() !== signerAddress.toLowerCase()) {
//         throw new Error("Connected wallet is not the escrow client");
//       }

//       if (status !== 0) {
//         throw new Error(`Escrow cannot be funded. Current blockchain status: ${status}`);
//       }

//       const value = ethers.parseEther(amount);
//       await contract.fundEscrow.staticCall(
//         escrowId,
//         {
//           value,
//         }
//       );

//       console.log("Funding transaction simulation passed");

//       const tx = await contract.fundEscrow(escrowId,{
//           value,
//         }
//       );

//       console.log("Funding transaction sent:",tx.hash);

//       const receipt = await tx.wait();

//       if (!receipt) {
//         throw new Error("Funding transaction failed");
//       }

//       console.log("Funding transaction confirmed:",receipt.hash);

//       if (prismaEscrowId) {
//         await axios.post("/api/escrow/fund",
//           {
//             escrowId: prismaEscrowId,
//             blockchainEscrowId: escrowId,
//             txHash: receipt.hash,
//             amount: Number(amount),
//             fromAddress: signerAddress,
//             toAddress:process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS,
//           }
//         );
//       }

//       return receipt;
//     } catch (err: unknown) {
//       console.error("Fund escrow error:", err);

//       const errorObj = err as {
//         shortMessage?: string;
//         reason?: string;
//         message?: string;
//       };

//       const message =
//         errorObj.shortMessage ||
//         errorObj.reason ||
//         errorObj.message ||
//         "Funding failed";

//       setError(message);

//       throw new Error(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --------------------------------------------------
//   // CREATE + FUND ESCROW
//   // --------------------------------------------------

// const createAndFundEscrow = async (
//   freelancerAddress: string,
//   amount: string
// ) => {
//   try {
//     setLoading(true);
//     setError(null);

//     if (!ethers.isAddress(freelancerAddress)) {
//       throw new Error("Invalid freelancer wallet address");
//     }

//     if (!amount || Number(amount) <= 0) {
//       throw new Error("Invalid escrow amount");
//     }

//     // --------------------------------------------------
//     // STEP 1: FORCE HARDHAT LOCAL NETWORK
//     // --------------------------------------------------

//     const provider = await switchToHardhatLocal();
//     const signer = await provider.getSigner();
//     const signerAddress = await signer.getAddress();
//     const network = await provider.getNetwork();
//     const expectedChainId = BigInt(process.env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID || "31337");

//     if (network.chainId !== expectedChainId) {
//         throw new Error(`Wrong network. Expected ${expectedChainId}, got ${network.chainId}`);
//       }

//     // --------------------------------------------------
//     // STEP 2: GET ESCROW CONTRACT
//     // --------------------------------------------------

//     const contract = getEscrowContract(signer);

//     const contractAddress = await contract.getAddress();

//     console.log("========== ESCROW DEBUG ==========");
//     console.log("Network:", network.chainId.toString());
//     console.log("Signer:", signerAddress);
//     console.log("Escrow contract:", contractAddress);

//     // --------------------------------------------------
//     // STEP 3: VERIFY CONTRACT EXISTS
//     // --------------------------------------------------

//     const contractCode = await provider.getCode(contractAddress);

//     console.log("Contract bytecode length:", contractCode.length);

//     if (!contractCode || contractCode === "0x") {
//       throw new Error(
//         `Escrow contract is not deployed at ${contractAddress}`
//       );
//     }

//     // --------------------------------------------------
//     // STEP 4: CREATE ESCROW
//     // --------------------------------------------------

//     const createTx = await contract.createEscrow(
//       freelancerAddress
//     );

//     console.log("Create escrow tx:", createTx.hash);

//     const createReceipt = await createTx.wait();

//     if (!createReceipt) {
//       throw new Error(
//         "Escrow creation transaction failed"
//       );
//     }

//     console.log("Create receipt:", createReceipt);
//     console.log(
//       "Create receipt logs:",
//       createReceipt.logs
//     );

//     // --------------------------------------------------
//     // STEP 5: FIND EscrowCreated EVENT
//     // --------------------------------------------------

//     let escrowIndex: bigint | null = null;

//     for (const log of createReceipt.logs) {
//       try {
//         const parsed = contract.interface.parseLog({
//           topics: [...log.topics],
//           data: log.data,
//         });

//         if (!parsed) {
//           continue;
//         }

//         console.log("Parsed event:", {
//           name: parsed.name,
//           args: parsed.args,
//         });

//         if (parsed.name === "EscrowCreated") {
//           // Prefer named argument if available.
//           if (
//             parsed.args &&
//             parsed.args.escrowId !== undefined
//           ) {
//             escrowIndex = BigInt(
//               parsed.args.escrowId
//             );
//           } else if (
//             parsed.args &&
//             parsed.args.id !== undefined
//           ) {
//             escrowIndex = BigInt(
//               parsed.args.id
//             );
//           } else {
//             // Fallback to first event argument.
//             escrowIndex = BigInt(
//               parsed.args[0]
//             );
//           }

//           break;
//         }
//       } catch (parseError) {
//         console.log(
//           "Skipping unrelated log:",
//           parseError
//         );
//       }
//     }

//     // --------------------------------------------------
//     // STEP 6: FALLBACK - READ CONTRACT COUNTER
//     // --------------------------------------------------

//     if (escrowIndex === null) {
//       console.error(
//         "EscrowCreated event was not found.",
//         {
//           contractAddress,
//           transactionHash: createTx.hash,
//           logs: createReceipt.logs,
//         }
//       );

//       throw new Error(
//         "EscrowCreated event was not found in the transaction receipt. Check the deployed contract, ABI and EscrowCreated event."
//       );
//     }

//     console.log(
//       "Blockchain escrow ID:",
//       escrowIndex.toString()
//     );

//     // --------------------------------------------------
//     // STEP 7: VERIFY ESCROW EXISTS
//     // --------------------------------------------------

//     const escrow = await contract.getEscrow(
//       escrowIndex
//     );

//     console.log("Created escrow:", {
//       id: escrowIndex.toString(),
//       client: escrow[0],
//       freelancer: escrow[1],
//       amount: ethers.formatEther(escrow[2]),
//       status: Number(escrow[3]),
//     });

//     // --------------------------------------------------
//     // STEP 8: FUND ESCROW
//     // --------------------------------------------------

//     const value = ethers.parseEther(amount);

//     await contract.fundEscrow.staticCall(
//       escrowIndex,
//       {
//         value,
//       }
//     );

//     console.log(
//       "Funding transaction simulation passed"
//     );

//     const fundTx = await contract.fundEscrow(
//       escrowIndex,
//       {
//         value,
//       }
//     );

//     console.log(
//       "Fund escrow tx:",
//       fundTx.hash
//     );

//     const fundReceipt = await fundTx.wait();

//     if (!fundReceipt) {
//       throw new Error(
//         "Funding transaction failed"
//       );
//     }

//     console.log(
//       "Fund escrow confirmed:",
//       fundReceipt.hash
//     );

//     // --------------------------------------------------
//     // STEP 9: RETURN BOTH TRANSACTIONS
//     // --------------------------------------------------

//     return {
//       receipt: fundReceipt,
//       escrowIndex: Number(escrowIndex),
//       createReceipt,
//       createTxHash: createTx.hash,
//       fundTxHash: fundTx.hash,
//     };
//   } catch (err: unknown) {
//     console.error(
//       "createAndFundEscrow error:",
//       err
//     );

//     const errorObj = err as {
//       shortMessage?: string;
//       reason?: string;
//       message?: string;
//     };

//     const message =
//       errorObj?.shortMessage ||
//       errorObj?.reason ||
//       errorObj?.message ||
//       "Funding failed";

//     setError(message);

//     throw new Error(message);
//   } finally {
//     setLoading(false);
//   }
// };

//   // --------------------------------------------------
//   // RELEASE PAYMENT
//   // --------------------------------------------------

//   const releasePayment = async (escrowId: number,prismaEscrowId: string,freelancerAddress: string,amount: number) => {
//     try {
//       setLoading(true);
//       setError(null);

//       if (!freelancerAddress) {
//         throw new Error("Freelancer wallet address is required");
//       }

//       const provider = getBrowserProvider();
//       const signer = await provider.getSigner();
//       const signerAddress = await signer.getAddress();
//       const contract = getEscrowContract(signer);
//       const network = await provider.getNetwork();
//       const expectedChainId = BigInt(process.env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID || "31337");

//       if (network.chainId !== expectedChainId) {throw new Error("Please connect to the configured blockchain network.");
//       }

//       const escrow = await contract.getEscrow(escrowId);
//       const clientAddress = escrow[0];
//       const status = Number(escrow[3]);

//       if (clientAddress.toLowerCase() !== signerAddress.toLowerCase()) {
//         throw new Error("Only the escrow client can release payment.");
//       }

//       if (status !== 1) {
//   throw new Error(
//     `Escrow ${escrowId} is not funded. On-chain status: ${status}`
//   );
// }


//       const tx =await contract.releasePayment(escrowId);
//       const receipt = await tx.wait();

//       if (!receipt) {
//         throw new Error("Payment release transaction failed");
//       }

//       if (prismaEscrowId) {
//         await axios.post("/api/escrow/release",{
//             escrowId: prismaEscrowId,
//             txHash: receipt.hash,
//             amount,
//             fromAddress:await signer.getAddress(),
//             toAddress:freelancerAddress,
//           }
//         );
//       }

//       return {
//         receipt,
//       };
//     } catch (err: unknown) {
//       console.error(
//         "Release payment error:",
//         err
//       );

//       const errorObj = err as {
//         shortMessage?: string;
//         reason?: string;
//         message?: string;
//       };

//       const message =
//         errorObj.shortMessage ||
//         errorObj.reason ||
//         errorObj.message ||
//         "Payment release failed";

//       setError(message);

//       throw new Error(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --------------------------------------------------
//   // REFUND
//   // --------------------------------------------------

//   const refundPayment = async (
//     escrowId: number,
//     prismaEscrowId: string = ""
//   ) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const provider =
//         getBrowserProvider();

//       const signer =
//         await provider.getSigner();

//       const contract =
//         getEscrowContract(signer);

//       const tx =
//         await contract.refundClient(
//           escrowId
//         );

//       const receipt =
//         await tx.wait();

//       if (!receipt) {
//         throw new Error(
//           "Refund transaction failed"
//         );
//       }

//       if (prismaEscrowId) {
//         await axios.post(
//           "/api/dispute/refund",
//           {
//             escrowId: prismaEscrowId,
//             txHash: receipt.hash,
//           }
//         );
//       }

//       return receipt;
//     } catch (err: unknown) {
//       console.error(
//         "Refund error:",
//         err
//       );

//       const errorObj = err as {
//         shortMessage?: string;
//         reason?: string;
//         message?: string;
//       };

//       const message =
//         errorObj.shortMessage ||
//         errorObj.reason ||
//         errorObj.message ||
//         "Refund failed";

//       setError(message);

//       throw new Error(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --------------------------------------------------
//   // ADMIN RELEASE
//   // --------------------------------------------------

//   const adminReleasePayment = async (escrowId: number) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const provider = getBrowserProvider();
//       const signer = await provider.getSigner();
//       const contract = getEscrowContract(signer);
//       const tx = await contract.adminReleasePayment(escrowId);
//       const receipt = await tx.wait();

//       return receipt;
//     } catch (err: unknown) {
//       console.error("Admin release error:",err);

//       const errorObj = err as {
//         shortMessage?: string;
//         reason?: string;
//         message?: string;
//       };

//       const message =
//         errorObj.shortMessage ||
//         errorObj.reason ||
//         errorObj.message ||
//         "Admin release failed";

//       setError(message);

//       throw new Error(message);
//     } finally {
//       setLoading(false);
//     }
//   };


//   const adminRefundClient = async (escrowId: number) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const provider = getBrowserProvider();
//       const signer = await provider.getSigner();
//       const contract = getEscrowContract(signer);
//       const tx = await contract.adminRefundClient(escrowId);
//       const receipt = await tx.wait();
//       return receipt;

//     } catch (err: unknown) {
//       console.error("Admin refund error:",err);
//       const errorObj = err as {shortMessage?: string;reason?: string;message?: string;};
//       const message = errorObj.shortMessage || errorObj.reason || errorObj.message ||"Admin refund failed";
//       setError(message);
//       throw new Error(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return {
//     createEscrow,
//     fundEscrow,
//     releasePayment,
//     refundPayment,
//     createAndFundEscrow,

//     adminReleasePayment,
//     adminRefundClient,

//     loading,
//     error,
//   };


import { ethers } from "ethers";
import {
  getConfiguredChainId,
  switchToHardhatLocal,
} from "@/lib/blockchain/provider";
import { getEscrowContract } from "@/lib/blockchain/escrow";

type EscrowData = {
  client: string;
  freelancer: string;
  amount: bigint;
  status: bigint;
};

function readStatus(escrow: EscrowData): bigint {
  return BigInt(escrow.status);
}

export async function createAndFundEscrow(
  freelancerAddress: string,
  amount: string
) {
  if (!ethers.isAddress(freelancerAddress)) {
    throw new Error("Invalid freelancer wallet address");
  }

  const value = ethers.parseEther(amount);

  if (value <= 0n) {
    throw new Error("Amount must be greater than zero");
  }

  const provider = await switchToHardhatLocal();
  const signer = await provider.getSigner();
  const network = await provider.getNetwork();

  if (network.chainId !== getConfiguredChainId()) {
    throw new Error("Connected network does not match configured network");
  }

  const contract = getEscrowContract(signer);

  // Step 1: Create escrow
  const createTx = await contract.createEscrow(freelancerAddress);
  const createReceipt = await createTx.wait();

  if (!createReceipt || createReceipt.status !== 1) {
    throw new Error("Escrow creation transaction failed");
  }

  // Step 2: Read escrow ID from EscrowCreated event
  let escrowIndex: bigint | null = null;

  for (const log of createReceipt.logs) {
    try {
      const parsed = contract.interface.parseLog({
        topics: [...log.topics],
        data: log.data,
      });

      if (parsed?.name === "EscrowCreated") {
        escrowIndex = BigInt(parsed.args[0]);
        break;
      }
    } catch {
      // Ignore logs that do not match this contract's ABI
    }
  }

  if (escrowIndex === null) {
    throw new Error(
      "EscrowCreated event not found. Check the event in escrowAbi."
    );
  }

  // Step 3: Fund escrow
  await contract.fundEscrow.staticCall(escrowIndex, {
    value,
  });

  const fundTx = await contract.fundEscrow(escrowIndex, {
    value,
  });

  const fundReceipt = await fundTx.wait();

  if (!fundReceipt || fundReceipt.status !== 1) {
    throw new Error("Funding transaction failed");
  }

  // Step 4: Verify on-chain funding
  const escrow = (await contract.getEscrow(
    escrowIndex
  )) as EscrowData;

  if (readStatus(escrow) !== 1n) {
    throw new Error(
      `Escrow is not funded. Current status: ${escrow.status.toString()}`
    );
  }

  console.log("Escrow funded successfully", {
    chainId: network.chainId.toString(),
    contractAddress: await contract.getAddress(),
    escrowId: escrowIndex.toString(),
    amount: escrow.amount.toString(),
    status: escrow.status.toString(),
  });

  return {
    receipt: fundReceipt,
    escrowIndex: Number(escrowIndex),
    createReceipt,
    createTxHash: createTx.hash,
    fundTxHash: fundTx.hash,
  };
}

export async function releasePayment(
  escrowId: number,
  prismaEscrowId: string,
  freelancerAddress: string,
  amount: string
) {
  const provider = await switchToHardhatLocal();
  const signer = await provider.getSigner();
  const signerAddress = await signer.getAddress();
  const network = await provider.getNetwork();

  if (network.chainId !== getConfiguredChainId()) {
    throw new Error("Connected network does not match configured network");
  }

  if (!ethers.isAddress(freelancerAddress)) {
    throw new Error("Invalid freelancer wallet address");
  }

  const contract = getEscrowContract(signer);
  const contractAddress = await contract.getAddress();

  // Read escrow from the blockchain
  const escrow = (await contract.getEscrow(
    escrowId
  )) as EscrowData;

  console.log("Escrow before release", {
    chainId: network.chainId.toString(),
    contractAddress,
    escrowId,
    client: escrow.client,
    freelancer: escrow.freelancer,
    amount: escrow.amount.toString(),
    status: escrow.status.toString(),
  });

  if (
    escrow.client.toLowerCase() !== signerAddress.toLowerCase()
  ) {
    throw new Error("Connected wallet is not the escrow client");
  }

  if (
    escrow.freelancer.toLowerCase() !== freelancerAddress.toLowerCase()
  ) {
    throw new Error(
      "Freelancer address does not match the on-chain escrow"
    );
  }

  // Contract enum: CREATED=0, FUNDED=1, RELEASED=2, REFUNDED=3
  if (readStatus(escrow) !== 1n) {
    throw new Error(
      `Escrow is not funded. Current on-chain status: ${escrow.status.toString()}. Fund a new escrow before releasing payment.`
    );
  }

  if (escrow.amount <= 0n) {
    throw new Error("Escrow has no funds to release");
  }

  // Release payment on-chain
  const tx = await contract.releasePayment(escrowId);
  const receipt = await tx.wait();

  if (!receipt || receipt.status !== 1) {
    throw new Error("Release transaction failed");
  }

  // Verify release status
  const updatedEscrow = (await contract.getEscrow(
    escrowId
  )) as EscrowData;

  if (readStatus(updatedEscrow) !== 2n) {
    throw new Error(
      "Transaction confirmed, but escrow status is not RELEASED"
    );
  }

  // Update database after blockchain confirmation
  const response = await fetch("/api/escrow/release", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      escrowId: prismaEscrowId,
      txHash: receipt.hash,
      amount,
      fromAddress: signerAddress,
      toAddress: freelancerAddress,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Payment released on-chain, but database update failed: ${errorText}`
    );
  }

  return {
    receipt,
    txHash: receipt.hash,
    escrowId,
    contractAddress,
    chainId: network.chainId.toString(),
  };
}
