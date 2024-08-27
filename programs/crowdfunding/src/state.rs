use anchor_lang::prelude::*;

#[account]
pub struct Campaign {
    pub title: String,
    pub description: String,
    pub org_name: String,
    pub project_link: String,
    pub project_image: String,
    pub authority: Pubkey,
    pub goal: u64,
    pub total_donated: u64,
    pub donation_completed: bool,
    pub claimed: bool,
    pub start_at: i64,
    pub end_at: i64,
    pub status: CampaignStatus,
}

#[account]
pub struct Contribution {
    pub amount: u64,
    pub authority: Pubkey,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum CampaignStatus {
    Active,
    Cancelled,
    Closed,
}
