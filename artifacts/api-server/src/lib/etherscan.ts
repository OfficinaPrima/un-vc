/**
 * Etherscan API client for network status data.
 * Uses the free Etherscan API (no key required for gas oracle).
 */

const ETHERSCAN_API = "https://api.etherscan.io/v2/api";

export interface NetworkStatus {
  safeGasPrice: number;      // gwei
  proposeGasPrice: number;    // gwei
  fastGasPrice: number;        // gwei
  baseFee: number;            // gwei
  congestion: "calm" | "moderate" | "busy" | "congested";
  estimatedConfirmMinutes: number;
  lastUpdated: string;
}

function getCongestionLevel(
  safeGas: number,
  fastGas: number,
  baseFee: number,
): NetworkStatus["congestion"] {
  const spread = fastGas - safeGas;
  if (baseFee < 10 && spread < 3) return "calm";
  if (baseFee < 25 && spread < 8) return "moderate";
  if (baseFee < 50 && spread < 15) return "busy";
  return "congested";
}

function getEstimatedMinutes(congestion: NetworkStatus["congestion"]): number {
  switch (congestion) {
    case "calm": return 1;
    case "moderate": return 2;
    case "busy": return 5;
    case "congested": return 10;
  }
}

export async function getNetworkStatus(): Promise<NetworkStatus> {
  const url = `${ETHERSCAN_API}?chainid=1&module=gastracker&action=gasoracle`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Etherscan API error: ${response.status}`);
  }

  const data = await response.json() as {
    status: string;
    message?: string;
    result?: {
      SafeGasPrice: string;
      ProposeGasPrice: string;
      FastGasPrice: string;
      suggestBaseFee: string;
    };
  };

  if (data.status !== "1" || !data.result) {
    throw new Error(data.message || "Etherscan returned invalid data");
  }

  const result = data.result;

  const safeGasPrice = Number(result.SafeGasPrice) || 0;
  const proposeGasPrice = Number(result.ProposeGasPrice) || 0;
  const fastGasPrice = Number(result.FastGasPrice) || 0;
  const baseFee = Number(result.suggestBaseFee) || 0;

  const congestion = getCongestionLevel(safeGasPrice, fastGasPrice, baseFee);
  const estimatedConfirmMinutes = getEstimatedMinutes(congestion);

  return {
    safeGasPrice,
    proposeGasPrice,
    fastGasPrice,
    baseFee,
    congestion,
    estimatedConfirmMinutes,
    lastUpdated: new Date().toISOString(),
  };
}
