import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection, TransactionSignature } from "@solana/web3.js";

/**
 * Airdrops SOL to a specified public key.
 * @param publicKey - The public key to which SOL will be airdropped.
 * @param amount - The amount of SOL to be airdropped in lamports.
 */
export async function airdropSol(publicKey: PublicKey, amount: number): Promise<void> {
  try {
    // Get the provider and connection from the Anchor framework
    const provider = anchor.getProvider();
    const connection = provider.connection;

    // Request the airdrop
    const airdropTx: TransactionSignature = await connection.requestAirdrop(publicKey, amount);

    // Confirm the transaction
    await confirmTransaction(airdropTx);
  } catch (error) {
    console.error("Failed to airdrop SOL:", error);
    throw error;
  }
}

/**
 * Confirms a transaction on the Solana blockchain.
 * @param tx - The transaction signature to be confirmed.
 */
export async function confirmTransaction(tx: TransactionSignature): Promise<void> {
  try {
    // Get the provider and connection from the Anchor framework
    const provider = anchor.getProvider();
    const connection = provider.connection;

    // Wait for the transaction to be confirmed
    await connection.confirmTransaction(tx, 'confirmed'); // 'confirmed' ensures the transaction is confirmed

    console.log(`Transaction ${tx} confirmed.`);
  } catch (error) {
    console.error("Failed to confirm transaction:", error);
    throw error;
  }
}
