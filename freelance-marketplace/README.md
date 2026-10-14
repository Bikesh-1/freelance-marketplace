This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the page.

This project uses `next/font` to automatically optimize and load Geist.

## Blockchain environment configuration

The default blockchain settings target a local Hardhat node. Start Hardhat at `http://127.0.0.1:8545` for local testing. Configure these values together for the same network:

- `NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID`: browser chain ID (defaults to `31337`).
- `NEXT_PUBLIC_BLOCKCHAIN_RPC_URL`: browser wallet network RPC URL (defaults to `http://127.0.0.1:8545`).
- `NEXT_PUBLIC_BLOCKCHAIN_CHAIN_NAME`: chain label shown when adding a network (defaults to `Hardhat Local`).
- `NEXT_PUBLIC_BLOCKCHAIN_CURRENCY_SYMBOL`: native currency symbol (defaults to `ETH`).
- `BLOCKCHAIN_RPC_URL`: server-side RPC URL (defaults to `http://127.0.0.1:8545`).
- `BLOCKCHAIN_CHAIN_ID`: expected server-side chain ID (defaults to `31337`).
- `BLOCKCHAIN_NETWORK`: network label stored with verified transactions (defaults to `hardhat-local`).
- `WALLET_DEPOSIT_ADDRESS`: required destination address for wallet deposits. Deposits fail closed until this is configured.
- `WALLET_WITHDRAWAL_ADDRESS`: required platform payout address. A withdrawal is credited only after a successful on-chain transfer from this address to the user's connected wallet.

Keep browser and server chain IDs/RPC endpoints aligned, and configure `NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS` to the escrow contract deployed on that same chain. Do not use a local Hardhat RPC URL for a hosted app unless the deployed server can reach that node.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive tutorial.
- [Next.js GitHub repository](https://github.com/vercel/next.js)

## Deploy on Vercel

See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for deployment details.
