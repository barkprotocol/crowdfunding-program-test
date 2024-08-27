use anchor_lang::prelude::*;

#[event]
pub struct CampaignCreated {
    pub campaign: Pubkey,
    pub title: String,
    pub description: String,
    pub goal: u64,
    pub start_at: i64,
    pub end_at: i64,
}

#[event]
pub struct CampaignCancelled {
    pub campaign: Pubkey,
}

#[event]
pub struct DonationReceived {
    pub campaign: Pubkey,
    pub donor: Pubkey,
    pub amount: u64,
}

#[event]
pub struct DonationCancelled {
    pub campaign: Pubkey,
    pub donor: Pubkey,
    pub amount: u64,
}

#[event]
pub struct DonationsClaimed {
    pub campaign: Pubkey,
    pub amount: u64,
}

#[event]
pub struct CampaignMetadataUpdated {
    pub campaign: Pubkey,
    pub title: String,
    pub description: String,
}

#[event]
pub struct DonationRefunded {
    pub campaign: Pubkey,
    pub donor: Pubkey,
    pub amount: u64,
}

#[event]
pub struct CampaignExtended {
    pub campaign: Pubkey,
    pub new_end_at: i64,
}

#[event]
pub struct CampaignClosed {
    pub campaign: Pubkey,
}
