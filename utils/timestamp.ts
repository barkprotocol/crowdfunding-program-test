import { Connection } from "@solana/web3.js";

/**
 * Fetches the current Unix timestamp from the Solana blockchain.
 * @param endpoint - The Solana RPC endpoint (default is mainnet).
 * @returns The current Unix timestamp in seconds, or null if an error occurs.
 */
export async function getUnixTimestamp(
  endpoint: string = "https://api.mainnet-beta.solana.com"
): Promise<number | null> {
  try {
    const connection = new Connection(endpoint, "processed");
    const slot = await connection.getSlot();
    const timestamp = await connection.getBlockTime(slot);

    if (timestamp === null) {
      throw new Error("Unable to fetch block time from the Solana blockchain.");
    }

    return timestamp;
  } catch (error) {
    console.error("Error fetching Unix timestamp from Solana blockchain:", error);
    return null;
  }
}

/**
 * Returns the current local Unix timestamp in seconds.
 * @returns The current local Unix timestamp in seconds.
 */
export function getTimestamp(): number {
  const now = new Date();
  return Math.floor(now.getTime() / 1000);
}

/**
 * Increments the current local timestamp by the specified amount of days, hours, minutes, and seconds.
 * @param days - Number of days to increment (default is 0).
 * @param hours - Number of hours to increment (default is 0).
 * @param minutes - Number of minutes to increment (default is 0).
 * @param seconds - Number of seconds to increment (default is 0).
 * @returns The incremented timestamp in seconds.
 * @throws Will throw an error if any of the increment values are negative.
 */
export function incrementCurrentTimestamp(
  days: number = 0,
  hours: number = 0,
  minutes: number = 0,
  seconds: number = 0
): number {
  if (days < 0 || hours < 0 || minutes < 0 || seconds < 0) {
    throw new Error("Increment values must be non-negative.");
  }

  const now = new Date();
  now.setDate(now.getDate() + days);
  now.setHours(now.getHours() + hours);
  now.setMinutes(now.getMinutes() + minutes);
  now.setSeconds(now.getSeconds() + seconds);

  return Math.floor(now.getTime() / 1000);
}
