export const escrowAbi = [
  "function createEscrow(address freelancer) returns (uint256)",

  "function fundEscrow(uint256 escrowId) payable",

  "function releasePayment(uint256 escrowId)",

  "function refundClient(uint256 escrowId)",

  "function getEscrow(uint256 escrowId) view returns (address client, address freelancer, uint256 amount, uint8 status)",

  "function getEscrowCount() view returns (uint256)",

  "event EscrowCreated(uint256 indexed escrowId, address indexed client, address indexed freelancer)",

  "event EscrowFunded(uint256 indexed escrowId, uint256 amount)",

  "event PaymentReleased(uint256 indexed escrowId, address indexed freelancer, uint256 amount)",

  "event PaymentRefunded(uint256 indexed escrowId, address indexed client, uint256 amount)",
] as const;