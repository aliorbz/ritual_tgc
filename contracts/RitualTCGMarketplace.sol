// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

contract RitualTCGMarketplace {
    uint256 public constant PLATFORM_FEE_PERCENT = 5;
    uint256 public listingFee = 0.001 ether;
    address public owner;
    address public feeReceiver;

    struct Listing {
        uint256 listingId;
        address nftAddress;
        uint256 tokenId;
        address payable seller;
        uint256 price;
        bool active;
    }

    uint256 private _listingIds;
    mapping(uint256 => Listing) public listings;
    mapping(address => mapping(uint256 => uint256)) public activeListings;

    event ItemListed(uint256 indexed listingId, address indexed nftAddress, uint256 indexed tokenId, address seller, uint256 price);
    event ItemSold(uint256 indexed listingId, address indexed nftAddress, uint256 indexed tokenId, address seller, address buyer, uint256 price);

    constructor(address initialOwner, address _feeReceiver) {
        owner = initialOwner;
        feeReceiver = _feeReceiver;
    }

    function listItem(address nftAddress, uint256 tokenId, uint256 price) external payable {
        require(msg.value == listingFee, "Fee");
        require(price > 0, "Price");
        require(IERC721(nftAddress).ownerOf(tokenId) == msg.sender, "Not owner");
        require(IERC721(nftAddress).isApprovedForAll(msg.sender, address(this)), "Not approved");

        _listingIds++;
        uint256 listingId = _listingIds;

        listings[listingId] = Listing({
            listingId: listingId,
            nftAddress: nftAddress,
            tokenId: tokenId,
            seller: payable(msg.sender),
            price: price,
            active: true
        });

        activeListings[nftAddress][tokenId] = listingId;

        (bool success, ) = payable(feeReceiver).call{value: msg.value}("");
        require(success, "Fee fail");

        emit ItemListed(listingId, nftAddress, tokenId, msg.sender, price);
    }

    function buyItem(uint256 listingId) external payable {
        Listing storage listing = listings[listingId];
        require(listing.active && msg.value == listing.price, "Invalid");

        listing.active = false;
        activeListings[listing.nftAddress][listing.tokenId] = 0;

        uint256 platformFee = (msg.value * PLATFORM_FEE_PERCENT) / 100;
        uint256 sellerProceeds = msg.value - platformFee;

        (bool sellerSuccess, ) = listing.seller.call{value: sellerProceeds}("");
        require(sellerSuccess, "Pay fail");

        (bool feeSuccess, ) = payable(feeReceiver).call{value: platformFee}("");
        require(feeSuccess, "Fee fail");

        IERC721(listing.nftAddress).safeTransferFrom(listing.seller, msg.sender, listing.tokenId);

        emit ItemSold(listingId, listing.nftAddress, listing.tokenId, listing.seller, msg.sender, msg.value);
    }
}
