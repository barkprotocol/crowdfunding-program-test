import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

/**
 * Derives the program address for a campaign based on the campaign title and signer.
 * @param programId - The public key of the program.
 * @param signerKey - The public key of the signer.
 * @param campaignTitle - The title of the campaign.
 * @returns An object containing the campaign public key and bump.
 */
export async function getProgramDerivedCampaign(
  programId: PublicKey,
  signerKey: PublicKey,
  campaignTitle: string
): Promise<{ campaign: PublicKey; bump: number }> {
  try {
    const seeds_campaign = [Buffer.from(campaignTitle), signerKey.toBytes()];
    const [campaign, bump] = PublicKey.findProgramAddressSync(
      seeds_campaign,
      programId
    );
    console.log(`Derived campaign address: ${campaign.toBase58()} with bump: ${bump}`);
    return { campaign, bump };
  } catch (error) {
    console.error("Error deriving campaign address:", error);
    throw error;
  }
}

/**
 * Derives the program address for a contribution to a specific campaign.
 * @param programId - The public key of the program.
 * @param signerKey - The public key of the signer.
 * @param campaign - The public key of the campaign.
 * @returns An object containing the contribution public key and bump.
 */
export async function getProgramDerivedContribution(
  programId: PublicKey,
  signerKey: PublicKey,
  campaign: PublicKey
): Promise<{ contribution: PublicKey; bump: number }> {
  try {
    const seeds_contribution = [campaign.toBytes(), signerKey.toBytes()];
    const [contribution, bump] = PublicKey.findProgramAddressSync(
      seeds_contribution,
      programId
    );
    console.log(`Derived contribution address: ${contribution.toBase58()} with bump: ${bump}`);
    return { contribution, bump };
  } catch (error) {
    console.error("Error deriving contribution address:", error);
    throw error;
  }
}
