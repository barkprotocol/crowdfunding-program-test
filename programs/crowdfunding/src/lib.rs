pub mod instructions;
pub mod state;
pub mod errors;
pub mod events;

use anchor_lang::prelude::*;
use instructions::*;
use state::*;
use errors::*;
use events::*;

declare_id!("32Qg9Pybde94crQEU8GaoBbhsMtjm2uer3MJZKLDbvHe");

#[program]
pub mod crowdfunding {
    use super::*;

    pub fn create_campaign(
        ctx: Context<CreateCampaign>,
        title: String,
        description: String,
        org_name: String,
        project_link: String,
        project_image: String,
        goal: u64,
        start_at: i64,
        end_at: i64
    ) -> Result<()> {
        instructions::create_campaign(
            ctx,
            title,
            description,
            org_name,
            project_link,
            project_image,
            goal,
            start_at,
            end_at
        )
    }

    pub fn cancel_campaign(ctx: Context<CancelCampaign>) -> Result<()> {
        instructions::cancel_campaign(ctx)
    }

    pub fn donate(ctx: Context<Donate>, amount: u64) -> Result<()> {
        instructions::donate(ctx, amount)
    }

    pub fn cancel_donation(ctx: Context<CancelDonation>) -> Result<()> {
        instructions::cancel_donation(ctx)
    }

    pub fn claim_donations(ctx: Context<ClaimDonations>) -> Result<()> {
        instructions::claim_donations(ctx)
    }

    pub fn update_campaign_metadata(
        ctx: Context<UpdateCampaignMetadata>,
        title: Option<String>,
        description: Option<String>,
        org_name: Option<String>,
        project_link: Option<String>,
        project_image: Option<String>
    ) -> Result<()> {
        instructions::update_campaign_metadata(ctx, title, description, org_name, project_link, project_image)
    }

    pub fn refund_donations(ctx: Context<RefundDonations>) -> Result<()> {
        instructions::refund_donations(ctx)
    }

    pub fn extend_campaign(ctx: Context<ExtendCampaign>, new_end_at: i64) -> Result<()> {
        instructions::extend_campaign(ctx, new_end_at)
    }

    pub fn close_campaign(ctx: Context<CloseCampaign>) -> Result<()> {
        instructions::close_campaign(ctx)
    }
}
