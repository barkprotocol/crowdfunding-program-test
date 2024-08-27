use anchor_lang::prelude::*;
use crate::state::{Campaign, CampaignStatus};
use crate::errors::Errors;
use crate::events::{CampaignCreated, CampaignCancelled, DonationReceived, DonationCancelled, DonationsClaimed, CampaignMetadataUpdated, DonationRefunded, CampaignExtended, CampaignClosed};
use anchor_lang::system_program;

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
    let campaign = &mut ctx.accounts.campaign;

    let clock = Clock::get()?;
    let current_timestamp = clock.unix_timestamp;

    // Validate campaign parameters
    require!(start_at >= current_timestamp, Errors::StartTimeEarly);
    require!(end_at > start_at, Errors::EndTimeSmall);
    require!(goal > 0, Errors::GoalZero);

    // Initialize the campaign account
    campaign.title = title;
    campaign.description = description;
    campaign.org_name = org_name;
    campaign.project_link = project_link;
    campaign.project_image = project_image;
    campaign.authority = ctx.accounts.signer.key();
    campaign.goal = goal;
    campaign.total_donated = 0;
    campaign.donation_completed = false;
    campaign.claimed = false;
    campaign.start_at = start_at;
    campaign.end_at = end_at;
    campaign.status = CampaignStatus::Active;

    // Emit event for campaign creation
    emit!(CampaignCreated {
        campaign: campaign.key(),
        title: campaign.title.clone(),
        description: campaign.description.clone(),
        goal: campaign.goal,
        start_at: campaign.start_at,
        end_at: campaign.end_at
    });

    msg!("Campaign '{}' created by {}", title, ctx.accounts.signer.key());

    Ok(())
}

pub fn cancel_campaign(ctx: Context<CancelCampaign>) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;

    let clock = Clock::get()?;
    let current_timestamp = clock.unix_timestamp;

    // Ensure the campaign hasn't started yet
    require!(current_timestamp < campaign.start_at, Errors::CampaignStarted);

    // Update campaign status to cancelled
    campaign.status = CampaignStatus::Cancelled;

    // Emit event for campaign cancellation
    emit!(CampaignCancelled {
        campaign: campaign.key(),
    });

    msg!("Campaign '{}' cancelled by {}", campaign.key(), ctx.accounts.signer.key());

    Ok(())
}

pub fn donate(ctx: Context<Donate>, amount: u64) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;
    let contribution = &mut ctx.accounts.contribution;

    let clock = Clock::get()?;
    let current_timestamp = clock.unix_timestamp;

    // Validate donation parameters
    require!(current_timestamp >= campaign.start_at, Errors::CampaignNotStarted);
    require!(current_timestamp <= campaign.end_at, Errors::CampaignOver);
    require!(!campaign.donation_completed, Errors::DonationCompleted);
    require!(amount > 0, Errors::AmountZero);

    // Calculate actual donation amount
    let remaining_amount = campaign.goal.checked_sub(campaign.total_donated).unwrap_or(0);
    let actual_donation = amount.min(remaining_amount);

    // Perform the transfer using CPI
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.signer.to_account_info(),
            to: campaign.to_account_info(),
        }
    );

    // Transfer funds
    system_program::transfer(cpi_context, actual_donation)?;

    // Update campaign and contribution
    campaign.total_donated += actual_donation;
    contribution.authority = ctx.accounts.signer.key();
    contribution.amount += actual_donation;

    // Check if donation goal has been met
    if campaign.total_donated >= campaign.goal {
        campaign.donation_completed = true;
    }

    // Emit event for donation received
    emit!(DonationReceived {
        campaign: campaign.key(),
        donor: ctx.accounts.signer.key(),
        amount: actual_donation
    });

    msg!("Donation of {} received for campaign '{}' from {}", actual_donation, campaign.key(), ctx.accounts.signer.key());

    Ok(())
}

pub fn cancel_donation(ctx: Context<CancelDonation>) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;
    let contribution = &mut ctx.accounts.contribution;

    let clock = Clock::get()?;
    let current_timestamp = clock.unix_timestamp;

    // Ensure the campaign has ended
    require!(current_timestamp > campaign.end_at, Errors::CampaignNotOver);
    require!(!campaign.donation_completed, Errors::DonationCompleted);

    let amount = contribution.amount;

    // Refund the donation
    **campaign.to_account_info().try_borrow_mut_lamports()? -= amount;
    **ctx.accounts.authority.to_account_info().try_borrow_mut_lamports()? += amount;

    // Emit event for donation cancellation
    emit!(DonationCancelled {
        campaign: campaign.key(),
        donor: ctx.accounts.authority.key(),
        amount: amount
    });

    msg!("Donation of {} cancelled for campaign '{}' by {}", amount, campaign.key(), ctx.accounts.authority.key());

    Ok(())
}

pub fn claim_donations(ctx: Context<ClaimDonations>) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;

    let clock = Clock::get()?;
    let current_timestamp = clock.unix_timestamp;

    // Validate claim conditions
    require!(current_timestamp > campaign.end_at, Errors::CampaignNotOver);
    require!(campaign.donation_completed, Errors::DonationNotCompleted);
    require!(!campaign.claimed, Errors::DonationsClaimed);

    let amount = campaign.total_donated;

    // Transfer the total donated amount to the campaign authority
    **campaign.to_account_info().try_borrow_mut_lamports()? -= amount;
    **ctx.accounts.authority.to_account_info().try_borrow_mut_lamports()? += amount;

    // Update campaign status
    campaign.claimed = true;

    // Emit event for donations claimed
    emit!(DonationsClaimed {
        campaign: campaign.key(),
        amount: amount
    });

    msg!("Donations of {} claimed for campaign '{}' by {}", amount, campaign.key(), ctx.accounts.authority.key());

    Ok(())
}

pub fn update_campaign_metadata(
    ctx: Context<UpdateCampaignMetadata>,
    title: Option<String>,
    description: Option<String>,
    org_name: Option<String>,
    project_link: Option<String>,
    project_image: Option<String>
) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;

    // Update campaign metadata based on provided options
    if let Some(new_title) = title {
        campaign.title = new_title;
    }
    if let Some(new_description) = description {
        campaign.description = new_description;
    }
    if let Some(new_org_name) = org_name {
        campaign.org_name = new_org_name;
    }
    if let Some(new_project_link) = project_link {
        campaign.project_link = new_project_link;
    }
    if let Some(new_project_image) = project_image {
        campaign.project_image = new_project_image;
    }

    // Emit event for metadata update
    emit!(CampaignMetadataUpdated {
        campaign: campaign.key(),
        title: campaign.title.clone(),
        description: campaign.description.clone()
    });

    msg!("Campaign metadata updated for campaign '{}' by {}", campaign.key(), ctx.accounts.signer.key());

    Ok(())
}

pub fn refund_donations(ctx: Context<RefundDonations>) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;
    let contribution = &mut ctx.accounts.contribution;

    let clock = Clock::get()?;
    let current_timestamp = clock.unix_timestamp;

    // Ensure the campaign has ended
    require!(current_timestamp > campaign.end_at, Errors::CampaignNotOver);
    require!(!campaign.donation_completed, Errors::DonationCompleted);

    let amount = contribution.amount;

    // Refund the donation
    **campaign.to_account_info().try_borrow_mut_lamports()? -= amount;
    **ctx.accounts.authority.to_account_info().try_borrow_mut_lamports()? += amount;

    // Emit event for donation refund
    emit!(DonationRefunded {
        campaign: campaign.key(),
        donor: ctx.accounts.authority.key(),
        amount: amount
    });

    msg!("Donation of {} refunded for campaign '{}' by {}", amount, campaign.key(), ctx.accounts.authority.key());

    Ok(())
}

pub fn extend_campaign(ctx: Context<ExtendCampaign>, new_end_at: i64) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;

    let clock = Clock::get()?;
    let current_timestamp = clock.unix_timestamp;

    // Validate new end time
    require!(new_end_at > campaign.end_at, Errors::EndTimeSmall);
    require!(new_end_at > current_timestamp, Errors::StartTimeEarly);

    // Update end time of the campaign
    campaign.end_at = new_end_at;

    // Emit event for campaign extension
    emit!(CampaignExtended {
        campaign: campaign.key(),
        new_end_at: new_end_at
    });

    msg!("Campaign '{}' extended to new end time {}", campaign.key(), new_end_at);

    Ok(())
}

pub fn close_campaign(ctx: Context<CloseCampaign>) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;

    let clock = Clock::get()?;
    let current_timestamp = clock.unix_timestamp;

    // Ensure the campaign has ended
    require!(current_timestamp > campaign.end_at, Errors::CampaignNotOver);

    // Update campaign status to closed
    campaign.status = CampaignStatus::Closed;

    // Emit event for campaign closure
    emit!(CampaignClosed {
        campaign: campaign.key(),
    });

    msg!("Campaign '{}' closed by {}", campaign.key(), ctx.accounts.signer.key());

    Ok(())
}

