export const RITUAL_NETWORK = {
  id: 1979,
  name: "Ritual",
  network: "ritual",
  nativeCurrency: {
    decimals: 18,
    name: "RITUAL",
    symbol: "RITUAL",
  },
  rpcUrls: {
    public: { http: ["https://rpc.ritualfoundation.org"] },
    default: { http: ["https://rpc.ritualfoundation.org"] },
  },
  blockExplorers: {
    default: { name: "Ritual Explorer", url: "https://explorer.ritualfoundation.org" },
  },
};

export const DISCORD_CONFIG = {
  serverId: "1210468736205852672",
  roles: {
    mod: "1218322564573822986",
    raiden: "1430908117331218442",
    ritualist: "1339006464139984906",
    ritty: "1430904963340566661",
    bitty: "1430904348757725325",
  },
};

export const MARKETPLACE_CONFIG = {
  listingFee: "0.01",
  platformFeePercent: 5,
  feeReceiver: "0x0000000000000000000000000000000000000000", // Update with user's wallet
};

export const ROLE_COLORS = {
  mod: {
    primary: "#FF1493", // Pink
    secondary: "#FF69B4",
    glow: "rgba(255, 20, 147, 0.5)",
    text: "text-pink-400",
    bg: "bg-pink-500/20",
    border: "border-pink-500/30"
  },
  radiant: {
    primary: "#FFD700", // Vibrant Golden
    secondary: "#FDB931",
    glow: "rgba(255, 215, 0, 0.7)",
    text: "text-yellow-400",
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/50"
  },
  ritualist: {
    primary: "#39FF14", // Neon Green
    secondary: "#32CD32",
    glow: "rgba(57, 255, 20, 0.5)",
    text: "text-green-400",
    bg: "bg-green-500/20",
    border: "border-green-500/30"
  },
  ritty: {
    primary: "#BF00FF", // Purple
    secondary: "#8B008B",
    glow: "rgba(191, 0, 255, 0.5)",
    text: "text-purple-400",
    bg: "bg-purple-500/20",
    border: "border-purple-500/30"
  },
  bitty: {
    primary: "#00BFFF", // Blue
    secondary: "#0000FF",
    glow: "rgba(0, 191, 255, 0.5)",
    text: "text-blue-400",
    bg: "bg-blue-500/20",
    border: "border-blue-500/30"
  },
};
export const CONTRACTS = {
  NFT: {
    address: "0x83cC6dbe668c7035Ecb8f779F76E7EB344326898",
    abi: [
      "function checkHasMinted(string discordId) public view returns (bool)",
      "function mintCard(address to, string discordId, string discordRole, string discordUsername) public returns (uint256)",
      "function ownerOf(uint256 tokenId) public view returns (address)",
      "function approve(address to, uint256 tokenId) public",
      "function isApprovedForAll(address owner, address operator) public view returns (bool)",
      "function setApprovalForAll(address operator, bool approved) public",
      "function cardData(uint256 tokenId) public view returns (string, string, string)"
    ]
  },
  MARKETPLACE: {
    address: "0x6922BC7C4711d94cbB6E7fF95D2f69f1639b9195",
    abi: [
      "function listItem(address nftAddress, uint256 tokenId, uint256 price) external payable",
      "function buyItem(uint256 listingId) external payable",
      "function listings(uint256 listingId) public view returns (uint256, address, uint256, address, uint256, bool)",
      "function activeListings(address nftAddress, uint256 tokenId) public view returns (uint256)",
      "function listingFee() public view returns (uint256)"
    ]
  }
};
