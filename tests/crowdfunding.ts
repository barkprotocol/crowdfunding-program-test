import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getProgramDerivedCampaign, getProgramDerivedContribution } from "./addressDerivation";
import idl from "./idl.json";

// Define the provider and program
const provider = anchor.AnchorProvider.env();
const programId = new PublicKey("YOUR_PROGRAM_ID"); // Replace with your actual program ID
const program = new anchor.Program(idl as anchor.Idl, programId, provider);

/**
 * Creates a new campaign on the Solana blockchain.
 * @param title - The title of the campaign.
 * @param description - The description of the campaign.
 * @param goal - The funding goal of the campaign (in lamports).
 * @param startAt - The start time of the campaign (timestamp).
 * @param endAt - The end time of the campaign (timestamp).
 * @returns The public key of the created campaign.
 */
export async function createCampaign(
  title: string,
  description: string,
  goal: number,
  startAt: number,
  endAt: number
): Promise<PublicKey> {
  const signerKey = provider.wallet.publicKey;
  const { campaign, bump } = await getProgramDerivedCampaign(programId, signerKey, title);

  // Ensure the campaign account is created
  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: signerKey,
      newAccountPubkey: campaign,
      lamports: await provider.connection.getMinimumBalanceForRentExemption(0),
      space: 8 + 200 + 8 + 8 + 8 + 1 + 1, // Adjust the space according to your data
      programId,
    })
  );

  await provider.sendAndConfirm(tx);

  // Call the createCampaign method
  await program.rpc.createCampaign(
    title,
    description,
    new anchor.BN(goal),
    new anchor.BN(startAt),
    new anchor.BN(endAt),
    bump,
    {
      accounts: {
        campaign,
        authority: signerKey,
        systemProgram: SystemProgram.programId,
      },
    }
  );

  return campaign;
}

/**
 * Updates the metadata of an existing campaign.
 * @param campaign - The public key of the campaign.
 * @param title - The new title of the campaign.
 * @param description - The new description of the campaign.
 */
export async function updateCampaignMetadata(
  campaign: PublicKey,
  title: string,
  description: string
): Promise<void> {
  const tx = await program.rpc.updateCampaignMetadata(
    title,
    description,
    {
      accounts: {
        campaign,
        authority: provider.wallet.publicKey,
      },
    }
  );

  await provider.sendAndConfirm(tx);
}

/**
 * Contributes to an existing campaign.
 * @param campaign - The public key of the campaign.
 * @param amount - The amount to contribute (in lamports).
 */
export async function contributeToCampaign(
  campaign: PublicKey,
  amount: number
): Promise<void> {
  const contributorKey = provider.wallet.publicKey;
  const { contribution } = await getProgramDerivedContribution(programId, contributorKey, campaign);

  // Transfer lamports to the contribution account
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: contributorKey,
      toPubkey: contribution,
      lamports: amount,
    })
  );

  await provider.sendAndConfirm(tx);

  // Call the contribute method
  await program.rpc.donate(
    new anchor.BN(amount),
    {
      accounts: {
        campaign,
        contributor: contributorKey,
        contribution,
        systemProgram: SystemProgram.programId,
      },
    }
  );
}

/**
 * Claims the funds of a completed campaign.
 * @param campaign - The public key of the campaign.
 */
export async function claimCampaignFunds(campaign: PublicKey): Promise<void> {
  const tx = await program.rpc.claimDonations({
    accounts: {
      campaign,
      authority: provider.wallet.publicKey,
    },
  });

  await provider.sendAndConfirm(tx);
}

/**
 * Cancels a donation and requests a refund.
 * @param campaign - The public key of the campaign.
 */
export async function cancelDonation(campaign: PublicKey): Promise<void> {
  const tx = await program.rpc.cancelDonation({
    accounts: {
      campaign,
      contributor: provider.wallet.publicKey,
    },
  });

  await provider.sendAndConfirm(tx);
}

/**
 * Extends the end date of a campaign.
 * @param campaign - The public key of the campaign.
 * @param newEndAt - The new end date (timestamp).
 */
export async function extendCampaign(campaign: PublicKey, newEndAt: number): Promise<void> {
  const tx = await program.rpc.extendCampaign(
    new anchor.BN(newEndAt),
    {
      accounts: {
        campaign,
        authority: provider.wallet.publicKey,
      },
    }
  );

  await provider.sendAndConfirm(tx);
}

/**
 * Closes a campaign before its end date.
 * @param campaign - The public key of the campaign.
 */
export async function closeCampaign(campaign: PublicKey): Promise<void> {
  const tx = await program.rpc.closeCampaign({
    accounts: {
      campaign,
      authority: provider.wallet.publicKey,
    },
  });

  await provider.sendAndConfirm(tx);
}

