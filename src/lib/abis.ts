export const RITUAL_TCG_CARD_ABI = [
  // Simplified ABI for common functions
  "function mintCard(address to, string memory tokenURI, string memory discordRole, string memory discordUsername) public returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "event CardMinted(uint256 indexed tokenId, address indexed owner, string discordRole)",
] as const;

export const RITUAL_TCG_MARKETPLACE_ABI = [
  "function listItem(address nftAddress, uint256 tokenId, uint256 price) external payable",
  "function buyItem(uint256 listingId) external payable",
  "function makeOffer(address nftAddress, uint256 tokenId) external payable",
  "function acceptOffer(uint256 offerId) external",
  "function cancelListing(uint256 listingId) external",
  "function cancelOffer(uint256 offerId) external",
  "event ItemListed(uint256 indexed listingId, address indexed nftAddress, uint256 indexed tokenId, address seller, uint256 price)",
  "event ItemSold(uint256 indexed listingId, address indexed nftAddress, uint256 indexed tokenId, address seller, address buyer, uint256 price)",
] as const;
