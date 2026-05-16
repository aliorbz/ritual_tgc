# Ritual TCG Cards

A full-stack Web3 TCG NFT marketplace for the Ritual testnet.

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the root directory:

```env
# NextAuth
AUTH_SECRET=your_random_secret
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# Web3
PRIVATE_KEY=your_wallet_private_key (for deployment)
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
```

### 2. Discord OAuth Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications).
2. Create a new application.
3. Under **OAuth2**, add a redirect URI: `http://localhost:3000/api/auth/callback/discord`.
4. Copy the Client ID and Client Secret to your `.env.local`.
5. Ensure the `guilds` and `guilds.members.read` scopes are available (you may need to invite your bot to the server with these permissions).

### 3. Install Dependencies
```bash
npm install
```

### 4. Smart Contracts
Compile and deploy to Ritual testnet:

```bash
npx hardhat compile --config hardhat.config.cjs
npx hardhat run scripts/deploy.ts --network ritual --config hardhat.config.cjs
```

### 5. Card Frames
Place your card frame PNGs in `public/assets/frames/`:
- `mod.png`
- `raiden.png`
- `ritualist.png`
- `ritty.png`
- `bitty.png`

### 6. Run the App
```bash
npm run dev
```

## Features
- **Discord Integration**: Verifies user roles in the Ritual Discord server.
- **Role-Based Minting**: Card type is determined by the user's highest role.
- **Full Marketplace**: List cards, make offers, and buy directly.
- **Royalties**: 5% marketplace fee on all trades.
- **Listing Fee**: 0.01 RITUAL for first-time listing.

## Mock Mode
If you don't have a Discord app setup yet, you can test the flow by clicking "use mock data" on the Create Card page.
