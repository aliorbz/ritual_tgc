// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

contract RitualTCGMarketplace {
    uint256 public constant PLATFORM_FEE_PERCENT = 5;
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

    struct Offer {
        address payable offerer;
        uint256 amount;
        bool active;
    }

    uint256 private _listingIds;
    mapping(uint256 => Listing) public listings;
    // nftAddress => tokenId => listingId
    mapping(address => mapping(uint256 => uint256)) public activeListings;
    
    // nftAddress => tokenId => offerer => Offer
    mapping(address => mapping(uint256 => mapping(address => Offer))) public offers;
    // nftAddress => tokenId => array of offerers (to help frontend read active offers)
    mapping(address => mapping(uint256 => address[])) public tokenOfferers;

    event ItemListed(uint256 indexed listingId, address indexed nftAddress, uint256 indexed tokenId, address seller, uint256 price);
    event ItemSold(uint256 indexed listingId, address indexed nftAddress, uint256 indexed tokenId, address seller, address buyer, uint256 price);
    event OfferMade(address indexed nftAddress, uint256 indexed tokenId, address offerer, uint256 amount);
    event OfferCancelled(address indexed nftAddress, uint256 indexed tokenId, address offerer);
    event OfferAccepted(address indexed nftAddress, uint256 indexed tokenId, address seller, address offerer, uint256 amount);

    constructor(address initialOwner, address _feeReceiver) {
        owner = initialOwner;
        feeReceiver = _feeReceiver;
    }

    function listItem(address nftAddress, uint256 tokenId, uint256 price) external {
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

        emit ItemListed(listingId, nftAddress, tokenId, msg.sender, price);
    }

    function buyItem(uint256 listingId) external payable {
        Listing storage listing = listings[listingId];
        require(listing.active && msg.value == listing.price, "Invalid");

        listing.active = false;
        activeListings[listing.nftAddress][listing.tokenId] = 0;

        _processSale(listing.nftAddress, listing.tokenId, listing.seller, msg.sender, msg.value);

        emit ItemSold(listingId, listing.nftAddress, listing.tokenId, listing.seller, msg.sender, msg.value);
    }

    function makeOffer(address nftAddress, uint256 tokenId) external payable {
        require(msg.value > 0, "Offer must be > 0");
        require(IERC721(nftAddress).ownerOf(tokenId) != msg.sender, "Owner cannot offer");

        Offer storage existingOffer = offers[nftAddress][tokenId][msg.sender];
        if (existingOffer.active) {
            // Refund the old offer if they are replacing it
            (bool success, ) = payable(msg.sender).call{value: existingOffer.amount}("");
            require(success, "Refund fail");
        } else {
            tokenOfferers[nftAddress][tokenId].push(msg.sender);
        }

        offers[nftAddress][tokenId][msg.sender] = Offer({
            offerer: payable(msg.sender),
            amount: msg.value,
            active: true
        });

        emit OfferMade(nftAddress, tokenId, msg.sender, msg.value);
    }

    function cancelOffer(address nftAddress, uint256 tokenId) external {
        Offer storage existingOffer = offers[nftAddress][tokenId][msg.sender];
        require(existingOffer.active, "No active offer");

        uint256 refundAmount = existingOffer.amount;
        existingOffer.active = false;
        existingOffer.amount = 0;

        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Refund fail");

        emit OfferCancelled(nftAddress, tokenId, msg.sender);
    }

    function acceptOffer(address nftAddress, uint256 tokenId, address offerer) external {
        require(IERC721(nftAddress).ownerOf(tokenId) == msg.sender, "Not owner");
        require(IERC721(nftAddress).isApprovedForAll(msg.sender, address(this)), "Not approved");

        Offer storage existingOffer = offers[nftAddress][tokenId][offerer];
        require(existingOffer.active, "No active offer");

        uint256 offerAmount = existingOffer.amount;
        existingOffer.active = false;
        existingOffer.amount = 0;

        // If it was listed, remove the listing
        uint256 listingId = activeListings[nftAddress][tokenId];
        if (listingId > 0) {
            listings[listingId].active = false;
            activeListings[nftAddress][tokenId] = 0;
        }

        _processSale(nftAddress, tokenId, payable(msg.sender), offerer, offerAmount);

        emit OfferAccepted(nftAddress, tokenId, msg.sender, offerer, offerAmount);
    }

    function _processSale(address nftAddress, uint256 tokenId, address payable seller, address buyer, uint256 price) internal {
        uint256 platformFee = (price * PLATFORM_FEE_PERCENT) / 100;
        uint256 sellerProceeds = price - platformFee;

        (bool sellerSuccess, ) = seller.call{value: sellerProceeds}("");
        require(sellerSuccess, "Pay fail");

        if (platformFee > 0) {
            (bool feeSuccess, ) = payable(feeReceiver).call{value: platformFee}("");
            require(feeSuccess, "Fee fail");
        }

        IERC721(nftAddress).safeTransferFrom(seller, buyer, tokenId);
    }

    function getOfferers(address nftAddress, uint256 tokenId) external view returns (address[] memory) {
        return tokenOfferers[nftAddress][tokenId];
    }
}
