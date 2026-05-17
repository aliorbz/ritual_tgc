import { parseAbi } from "viem";

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
    public: { http: [process.env.NODE_ENV === "development" ? "http://127.0.0.1:8545" : "https://rpc.ritualfoundation.org"] },
    default: { http: [process.env.NODE_ENV === "development" ? "http://127.0.0.1:8545" : "https://rpc.ritualfoundation.org"] },
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
  feeReceiver: "0x0000000000000000000000000000000000000000",
};

export const ROLE_COLORS = {
  mod: {
    primary: "#FF1493",
    secondary: "#FF69B4",
    glow: "rgba(255, 20, 147, 0.5)",
    text: "text-pink-400",
    bg: "bg-pink-500/20",
    border: "border-pink-500/30"
  },
  radiant: {
    primary: "#FFD700",
    secondary: "#FDB931",
    glow: "rgba(255, 215, 0, 0.7)",
    text: "text-yellow-400",
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/50"
  },
  ritualist: {
    primary: "#39FF14",
    secondary: "#32CD32",
    glow: "rgba(57, 255, 20, 0.5)",
    text: "text-green-400",
    bg: "bg-green-500/20",
    border: "border-green-500/30"
  },
  ritty: {
    primary: "#BF00FF",
    secondary: "#8B008B",
    glow: "rgba(191, 0, 255, 0.5)",
    text: "text-purple-400",
    bg: "bg-purple-500/20",
    border: "border-purple-500/30"
  },
  bitty: {
    primary: "#00BFFF",
    secondary: "#0000FF",
    glow: "rgba(0, 191, 255, 0.5)",
    text: "text-blue-400",
    bg: "bg-blue-500/20",
    border: "border-blue-500/30"
  },
};

// ── Typed ABIs (parsed for wagmi/viem compatibility) ──────────────────
export const NFT_ABI = parseAbi([
  "function checkHasMinted(string discordId) public view returns (bool)",
  "function checkHasMintedRole(string discordId, string discordRole) public view returns (bool)",
  "function mintCard(address to, string discordId, string discordRole, string discordUsername) public payable returns (uint256)",
  "function updateCardData(uint256 tokenId, string discordRole, string discordUsername) public",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "function tokenByIndex(uint256 index) public view returns (uint256)",
  "function totalSupply() public view returns (uint256)",
  "function approve(address to, uint256 tokenId) public",
  "function isApprovedForAll(address owner, address operator) public view returns (bool)",
  "function setApprovalForAll(address operator, bool approved) public",
  "function cardData(uint256 tokenId) public view returns (string discordId, string discordRole, string discordUsername)",
  "function MINT_FEE() public view returns (uint256)",
]);

export const MARKETPLACE_ABI = parseAbi([
  "function listItem(address nftAddress, uint256 tokenId, uint256 price) external",
  "function cancelListing(uint256 listingId) external",
  "function buyItem(uint256 listingId) external payable",
  "function listings(uint256 listingId) public view returns (uint256 listingId, address nftAddress, uint256 tokenId, address seller, uint256 price, bool active)",
  "function activeListings(address nftAddress, uint256 tokenId) public view returns (uint256)",
  "function makeOffer(address nftAddress, uint256 tokenId) external payable",
  "function cancelOffer(address nftAddress, uint256 tokenId) external",
  "function acceptOffer(address nftAddress, uint256 tokenId, address offerer) external",
  "function offers(address nftAddress, uint256 tokenId, address offerer) public view returns (address offerer, uint256 amount, bool active)",
  "function getOfferers(address nftAddress, uint256 tokenId) external view returns (address[])",
]);

export const CONTRACTS = {
  NFT: {
    address: (process.env.NODE_ENV === "development" 
      ? "0x5FbDB2315678afecb367f032d93F642f64180aa3" 
      : "0x3709CE39819fE72F6eF9d76E7196481219A995Db") as const,
    abi: NFT_ABI,
  },
  MARKETPLACE: {
    address: (process.env.NODE_ENV === "development" 
      ? "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" 
      : "0x2a3C8A880398FF6DD8e6F9976c8BE6C8aBef2435") as const,
    abi: MARKETPLACE_ABI,
  },
};
