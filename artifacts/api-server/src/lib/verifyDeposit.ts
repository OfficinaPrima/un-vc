import { createPublicClient, http, parseAbi, formatUnits } from "viem";
import { mainnet } from "viem/chains";

const USDC_CONTRACT = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDC_DECIMALS = 6;

// Use MEVBlocker — supports archive log queries with indexed topic filters.
// For production with heavy load, swap to a paid provider (Alchemy/Infura/QuickNode).
const rpcUrl = "https://rpc.mevblocker.io";

const client = createPublicClient({
  chain: mainnet,
  transport: http(rpcUrl, { batch: false }),
});

const transferAbi = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);

export interface VerifyResult {
  verified: boolean;
  amount: number;
  txHash?: string;
  blockNumber?: bigint;
}

const BLOCK_RANGE = 40000n; // Safe under 50k limit

export async function verifyUSDCDeposit(
  walletAddress: string,
  fundAddress: string,
): Promise<VerifyResult> {
  const normalizedWallet = walletAddress.toLowerCase();
  const normalizedFund = fundAddress.toLowerCase();

  const latestBlock = await client.getBlockNumber();
  let fromBlock = latestBlock - BLOCK_RANGE;
  if (fromBlock < 0n) fromBlock = 0n;

  const allLogs: any[] = [];

  while (fromBlock <= latestBlock) {
    const toBlock = fromBlock + BLOCK_RANGE > latestBlock ? latestBlock : fromBlock + BLOCK_RANGE;

    try {
      const logs = await client.getLogs({
        address: USDC_CONTRACT,
        event: transferAbi[0],
        args: {
          from: normalizedWallet as `0x${string}`,
          to: normalizedFund as `0x${string}`,
        },
        fromBlock,
        toBlock,
      });
      allLogs.push(...logs);
    } catch (err: any) {
      // If block range still too large, halve it
      if (err.message?.includes("block range")) {
        break;
      }
      throw err;
    }

    fromBlock = toBlock + 1n;
  }

  if (allLogs.length === 0) {
    return { verified: false, amount: 0 };
  }

  // Sum all transfers
  let totalAmount = 0n;
  for (const log of allLogs) {
    totalAmount += log.args.value ?? 0n;
  }

  const amountUSD = parseFloat(formatUnits(totalAmount, USDC_DECIMALS));
  const verified = amountUSD >= 50;

  // Return the most recent transfer as reference
  const lastLog = allLogs[allLogs.length - 1];

  return {
    verified,
    amount: amountUSD,
    txHash: lastLog.transactionHash,
    blockNumber: lastLog.blockNumber,
  };
}
