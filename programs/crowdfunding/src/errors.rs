use anchor_lang::prelude::*;

#[error_code]
pub enum Errors {
    #[msg("The start time of the campaign is in the past.")]
    StartTimeEarly,
    #[msg("The end time must be after the start time.")]
    EndTimeSmall,
    #[msg("The goal amount must be greater than zero.")]
    GoalZero,
    #[msg("Campaign has already started.")]
    CampaignStarted,
    #[msg("Campaign is not yet started.")]
    CampaignNotStarted,
    #[msg("Campaign is over.")]
    CampaignOver,
    #[msg("Donations have already been completed.")]
    DonationCompleted,
    #[msg("Donation amount must be greater than zero.")]
    AmountZero,
    #[msg("Campaign donations are not yet completed.")]
    DonationNotCompleted,
    #[msg("Donations have already been claimed.")]
    DonationsClaimed,
    #[msg("Campaign has not yet ended.")]
    CampaignNotOver,
    #[msg("End time of the campaign must be after the current time.")]
    EndTimeSmall,
}
