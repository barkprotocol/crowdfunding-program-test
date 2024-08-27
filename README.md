
# Crowdfunding Program and Crowdfunding Platform Backend

## Overview

Welcome to the BARK Protocol's Solana-based crowdfunding program, developed using Anchor. This program enables users to create and manage crowdfunding campaigns on the Solana blockchain. It includes comprehensive features for campaign management, donation handling, updates, refunds, and more. 

Additionally, the program provides a backend for integrating with various platform features, enhancing functionality, and managing campaign data efficiently.

## Features

- **Create Campaign**: Set up a new crowdfunding campaign with details such as title, description, goal, and timing constraints.
- **Cancel Campaign**: Abort a campaign before it starts.
- **Donate**: Contribute funds to an ongoing campaign.
- **Cancel Donation**: Withdraw a donation and receive a refund if the campaign has not ended.
- **Claim Donations**: Retrieve the total funds donated to a campaign upon its successful completion.
- **Update Campaign Metadata**: Change details of an existing campaign.
- **Refund Donations**: Return donations if the campaign fails to meet its goal or is unsuccessful.
- **Extend Campaign**: Extend the end date of an active campaign.
- **Close Campaign**: Close a campaign before its scheduled end date.

## Getting Started

### Prerequisites

Ensure you have the following tools installed:

- **Rust**: Install Rust using [rustup](https://rustup.rs/).
- **Anchor**: Install the Anchor CLI by following [Anchor's installation guide](https://project-serum.github.io/anchor/getting-started/installation.html).
- **Solana CLI**: Install Solana CLI tools from [Solana's installation guide](https://docs.solana.com/cli/install-solana-cli-tools).

### Installation

1. **Clone the repository:**

    ```sh
    git clone https://github.com/barkprotocol/crowdfunding-program.git
    cd crowdfunding-program
    ```

2. **Build the program:**

    ```sh
    anchor build
    ```

3. **Set up your local environment:**

    - Start a local Solana test validator:

        ```sh
        solana-test-validator
        ```

    - Configure your Solana CLI to use the local test validator:

        ```sh
        solana config set --url localhost
        ```

### Running Tests

1. **Deploy the program to the local test validator:**

    ```sh
    anchor deploy
    ```

2. **Execute the test suite:**

    ```sh
    anchor test
    ```

## Usage

### Creating a Campaign

To create a new campaign, use the `create_campaign` function with necessary details:

```sh
anchor run create_campaign --title "Campaign Title" --description "Campaign Description" --org_name "Organization Name" --project_link "http://project.link" --project_image "http://image.link" --goal 1000000 --start_at 1672531200 --end_at 1675123200
```

### Donating to a Campaign

To donate to a campaign, use the `donate` function:

```sh
anchor run donate --campaign "CAMPAIGN_PUBLIC_KEY" --amount 50000
```

### Canceling a Donation

To cancel a donation and receive a refund, use the `cancel_donation` function:

```sh
anchor run cancel_donation --campaign "CAMPAIGN_PUBLIC_KEY"
```

### Claiming Donations

To claim funds from a successfully completed campaign, use the `claim_donations` function:

```sh
anchor run claim_donations --campaign "CAMPAIGN_PUBLIC_KEY"
```

### Updating Campaign Metadata

To update metadata for an existing campaign, use the `update_campaign_metadata` function:

```sh
anchor run update_campaign_metadata --campaign "CAMPAIGN_PUBLIC_KEY" --title "Updated Title"
```

### Extending a Campaign

To extend the end date of a campaign, use the `extend_campaign` function:

```sh
anchor run extend_campaign --campaign "CAMPAIGN_PUBLIC_KEY" --new_end_at 1687238400
```

### Closing a Campaign

To close a campaign before its end date, use the `close_campaign` function:

```sh
anchor run close_campaign --campaign "CAMPAIGN_PUBLIC_KEY"
```

## Events

The program emits events to signal important actions:

- `CampaignCreated`
- `CampaignCancelled`
- `DonationReceived`
- `DonationCancelled`
- `DonationsClaimed`
- `CampaignMetadataUpdated`
- `DonationRefunded`
- `CampaignExtended`
- `CampaignClosed`

These events can be used for real-time updates and integration with off-chain systems.

## Contributing

Contributions are welcome! Please submit issues or pull requests for any improvements or bug fixes. Ensure that your contributions follow the code style guidelines and include relevant tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
