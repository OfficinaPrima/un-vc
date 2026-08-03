import { createPublicClient, http, parseAbi, formatUnits } from "viem";
import { mainnet } from "viem/chains";

const USDC_CONTRACT = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDC_DECIMALS = 6;
const rpcUrl = "https://rpc.mevblocker.io";

const client = createPublicClient({
  chain: mainnet,
  transport: http(rpcUrl, { batch: false }),
});

const balanceAbi = parseAbi([
  "function balanceOf(address account) view returns (uint256)",
]);

// Read the fund wallet's current USDC balance, in dollars.
export async function getFundBalanceUsd(fundAddress: string): Promise<number> {
  const raw = (await client.readContract({
    address: USDC_CONTRACT,
    abi: balanceAbi,
    functionName: "balanceOf",
    args: [fundAddress as `0x${string}`],
  })) as bigint;
  return parseFloat(formatUnits(raw, USDC_DECIMALS));
}
