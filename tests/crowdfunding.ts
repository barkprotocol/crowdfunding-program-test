import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { Crowdfunding } from "../target/types/crowdfunding";
import {
  airdropSol,
  delay,
  getProgramDerivedCampaign,
  getProgramDerivedContribution,
  incrementCurrentTimestamp,
} from "../utils";
import { expect } from "chai";

describe("crowdfunding", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Crowdfunding as Program<Crowdfunding>;
  const wallets = Array.from({ length: 5 }, () => anchor.web3.Keypair.generate());

  let campaigns: Record<number, PublicKey> = {};
  let contributions: Record<number, PublicKey[]> = { 1: [], 2: [] };

  before(async () => {
    await Promise.all(
      wallets.map(wallet => airdropSol(wallet.publicKey, 100 * LAMPORTS_PER_SOL))
    );
  });

  async function createCampaignHelper(
    wallet: Keypair,
    title: string,
    goal: BN,
    startOffset: number,
    endOffset: number
  ): Promise<PublicKey> {
    const startTimestamp = await incrementCurrentTimestamp(0, 0, 0, startOffset);
    const endTimestamp = await incrementCurrentTimestamp(0, 0, 0, endOffset);

    const campaignParams = {
      title,
      description: `This is ${title}`,
      org_name: "org name",
      project_link: "project link",
      project_image: "project image",
      goal,
      startAt: new BN(startTimestamp),
      endAt: new BN(endTimestamp),
    };

    const { campaign } = await getProgramDerivedCampaign(
      program.programId,
      wallet.publicKey,
      campaignParams.title
    );

    await program.methods
      .createCampaign(
        campaignParams.title,
        campaignParams.description,
        campaignParams.org_name,
        campaignParams.project_link,
        campaignParams.project_image,
        campaignParams.goal,
        campaignParams.startAt,
        campaignParams.endAt
      )
      .accounts({
        signer: wallet.publicKey,
        campaign,
      })
      .signers([wallet])
      .rpc();

    return campaign;
  }

  describe("Create campaign", () => {
    it("should revert if invalid params", async () => {
      const startTimestamp = await incrementCurrentTimestamp(0, 0, 0, 1);
      const endTimestamp = await incrementCurrentTimestamp(2, 3);

      const campaignParams = {
        title: "Campaign 1",
        description: "This is a Campaign 1",
        org_name: "org name",
        project_link: "project link",
        project_image: "project image",
        goal: new BN(10 * LAMPORTS_PER_SOL),
        startAt: new BN(startTimestamp),
        endAt: new BN(endTimestamp),
      };

      const { campaign } = await getProgramDerivedCampaign(
        program.programId,
        wallets[0].publicKey,
        campaignParams.title
      );

      const createCampaign = async (
        title: string,
        description: string,
        org_name: string,
        project_link: string,
        project_image: string,
        goal: BN,
        startAt: BN,
        endAt: BN
      ) => {
        return await program.methods
          .createCampaign(
            title,
            description,
            org_name,
            project_link,
            project_image,
            goal,
            startAt,
            endAt
          )
          .accounts({
            signer: wallets[0].publicKey,
            campaign,
          })
          .signers([wallets[0]])
          .rpc();
      };

      const testCases = [
        {
          startAt: new BN(startTimestamp - 1000),
          endAt: campaignParams.endAt,
          expectedError: "Start time must be in the future",
        },
        {
          startAt: campaignParams.startAt,
          endAt: campaignParams.startAt,
          expectedError: "End time must be after start time",
        },
        {
          startAt: campaignParams.startAt,
          endAt: campaignParams.endAt,
          goal: new BN(0),
          expectedError: "Goal must be greater than 0",
        },
      ];

      for (const testCase of testCases) {
        try {
          await createCampaign(
            campaignParams.title,
            campaignParams.description,
            campaignParams.org_name,
            campaignParams.project_link,
            campaignParams.project_image,
            testCase.goal || campaignParams.goal,
            testCase.startAt,
            testCase.endAt
          );
        } catch (error) {
          expect(error.error.errorMessage).to.equal(testCase.expectedError);
        }
      }
    });

    it("should be able to create campaigns", async () => {
      campaigns[1] = await createCampaignHelper(
        wallets[0],
        "Campaign 1",
        new BN(10 * LAMPORTS_PER_SOL),
        1,
        5
      );
      campaigns[2] = await createCampaignHelper(
        wallets[1],
        "Campaign 2",
        new BN(2.5 * LAMPORTS_PER_SOL),
        1,
        5
      );
      campaigns[3] = await createCampaignHelper(
        wallets[2],
        "Campaign 3",
        new BN(15 * LAMPORTS_PER_SOL),
        1,
        5
      );

      // Additional assertions to verify campaign creation can be added here
    });
  });

  describe("Donate", () => {
    async function donateHelper(
      wallet: Keypair,
      campaign: PublicKey,
      amount: BN
    ): Promise<PublicKey> {
      const { contribution } = await getProgramDerivedContribution(
        program.programId,
        wallet.publicKey,
        campaign
      );

      await delay(2000); // Optional delay for timing issues

      await program.methods
        .donate(amount)
        .accounts({
          signer: wallet.publicKey,
          campaign,
          contribution,
        })
        .signers([wallet])
        .rpc();

      return contribution;
    }

    it("should be able to donate", async () => {
      const contributionAmount1 = new BN(5.5 * LAMPORTS_PER_SOL);
      contributions[1][0] = await donateHelper(
        wallets[1],
        campaigns[1],
        contributionAmount1
      );

      const contributionAmount2 = new BN(4.5 * LAMPORTS_PER_SOL);
      contributions[1][1] = await donateHelper(
        wallets[2],
        campaigns[1],
        contributionAmount2
      );

      const contributionAmount3 = new BN(1 * LAMPORTS_PER_SOL);
      contributions[2][0] = await donateHelper(
        wallets[3],
        campaigns[2],
        contributionAmount3
      );

      // Additional assertions to verify donations can be added here
    });

    it("should revert if donation completed", async () => {
      const { contribution } = await getProgramDerivedContribution(
        program.programId,
        wallets[3].publicKey,
        campaigns[1]
      );

      try {
        await program.methods
          .donate(new BN(2 * LAMPORTS_PER_SOL))
          .accounts({
            signer: wallets[3].publicKey,
            campaign: campaigns[1],
            contribution,
          })
          .signers([wallets[3]])
          .rpc();
      } catch (error) {
        expect(error.error.errorMessage).to.equal("Donation has already been completed");
      }
    });
  });

  describe("Claim Donations", () => {
    it("should be able to claim donations", async () => {
      await delay(3000);

      const claimDonationsHelper = async (campaign: PublicKey, wallet: Keypair) => {
        await program.methods
          .claimDonations()
          .accounts({
            campaign,
            authority: wallet.publicKey,
          })
          .signers([wallet])
          .rpc();
      };

      await claimDonationsHelper(campaigns[1], wallets[0]);

      // Additional assertions to verify donations claiming can be added here
    });

    it("should revert if signer is not authority", async () => {
      try {
        await program.methods
          .claimDonations()
          .accounts({
            campaign: campaigns[1],
            authority: wallets[1].publicKey,
          })
          .signers([wallets[1]])
          .rpc();
      } catch (error) {
        expect(error.error.errorMessage).to.equal("Signer is not the authority");
      }
    });

    it("should revert if donations already claimed", async () => {
      try {
        await program.methods
          .claimDonations()
          .accounts({
            campaign: campaigns[1],
            authority: wallets[0].publicKey,
          })
          .signers([wallets[0]])
          .rpc();
      } catch (error) {
        expect(error.error.errorMessage).to.equal("Donations have already been claimed");
      }
    });

    it("should revert if donation not completed", async () => {
      try {
        await program.methods
          .claimDonations()
          .accounts({
            campaign: campaigns[2],
            authority: wallets[1].publicKey,
          })
          .signers([wallets[1]])
          .rpc();
      } catch (error) {
        expect(error.error.errorMessage).to.equal("No completed donations to claim");
      }
    });
  });

  describe("Cancel Donation", () => {
    const cancelDonationHelper = async (
      wallet: Keypair,
      campaign: PublicKey,
      contribution: PublicKey
    ) => {
      await program.methods
        .cancelDonation()
        .accounts({
          signer: wallet.publicKey,
          campaign,
          contribution,
        })
        .signers([wallet])
        .rpc();
    };

    it("should be able to cancel donations", async () => {
      await cancelDonationHelper(wallets[3], campaigns[2], contributions[2][0]);

      // Additional assertions to verify donation cancellation can be added here
    });

    it("should revert if signer is not donor", async () => {
      try {
        await cancelDonationHelper(wallets[4], campaigns[2], contributions[2][0]);
      } catch (error) {
        expect(error.error.errorMessage).to.equal("Signer is not the donor");
      }
    });

    it("should revert if donation already canceled", async () => {
      try {
        await cancelDonationHelper(wallets[3], campaigns[2], contributions[2][0]);
      } catch (error) {
        expect(error.error.errorMessage).to.equal("Donation has already been canceled");
      }
    });

    it("should revert if campaign already completed", async () => {
      try {
        await cancelDonationHelper(wallets[2], campaigns[1], contributions[1][0]);
      } catch (error) {
        expect(error.error.errorMessage).to.equal("Campaign has already been completed");
      }
    });
  });

  describe("Cancel Campaign", () => {
    const cancelCampaignHelper = async (wallet: Keypair, campaign: PublicKey) => {
      await program.methods
        .cancelCampaign()
        .accounts({
          signer: wallet.publicKey,
          campaign,
        })
        .signers([wallet])
        .rpc();
    };

    it("should be able to cancel campaign", async () => {
      const campaign = await createCampaignHelper(
        wallets[2],
        "Cancelable Campaign",
        new BN(10 * LAMPORTS_PER_SOL),
        2,
        5
      );

      await cancelCampaignHelper(wallets[2], campaign);

      // Additional assertions to verify campaign cancellation can be added here
    });

    it("should revert if signer is not campaign authority", async () => {
      try {
        await cancelCampaignHelper(wallets[3], campaigns[3]);
      } catch (error) {
        expect(error.error.errorMessage).to.equal("Signer is not the campaign authority");
      }
    });

    it("should revert if campaign already started", async () => {
      try {
        await cancelCampaignHelper(wallets[2], campaigns[2]);
      } catch (error) {
        expect(error.error.errorMessage).to.equal("Campaign has already started");
      }
    });
  });
});
