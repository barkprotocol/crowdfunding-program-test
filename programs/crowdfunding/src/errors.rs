// src/errors.rs
use anchor_lang::prelude::*;

#[error_code]
pub enum Errors {
    #[msg("The start time is too early.")]
    StartTimeEarly,
    #[msg("The end time is too short.")]
    EndTimeSmall,
    #[msg("The goal cannot be zero.")]
    GoalZero,
    #[msg("The campaign has already started.")]
    CampaignStarted,
    #[msg("The campaign has already ended.")]
    CampaignOver,
    #[msg("The donation has been completed.")]
    DonationCompleted,
    #[msg("The donation amount cannot be zero.")]
    AmountZero,
    #[msg("The campaign has not started.")]
    CampaignNotStarted,
    #[msg("The campaign is not yet over.")]
    CampaignNotOver,
    #[msg("The donation has already been completed.")]
    DonationNotCompleted,
    #[msg("The donations have already been claimed.")]
    DonationsClaimed,
}
