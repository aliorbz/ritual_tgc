// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RitualTCGCard {
    string public name = "Ritual TCG Cards";
    string public symbol = "RTCG";
    address public owner;
    uint256 private _nextTokenId;
    string private _baseTokenURI;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(string => bool) public discordIdMinted;

    struct CardMetadata {
        string discordId;
        string discordRole;
        string discordUsername;
    }
    mapping(uint256 => CardMetadata) public cardData;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    constructor(address initialOwner, string memory baseURI) {
        owner = initialOwner;
        _baseTokenURI = baseURI;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function mintCard(
        address to,
        string memory discordId,
        string memory discordRole,
        string memory discordUsername
    ) public onlyOwner returns (uint256) {
        require(!discordIdMinted[discordId], "Already minted");
        
        uint256 tokenId = _nextTokenId++;
        _owners[tokenId] = to;
        _balances[to]++;
        
        cardData[tokenId] = CardMetadata({
            discordId: discordId,
            discordRole: discordRole,
            discordUsername: discordUsername
        });

        discordIdMinted[discordId] = true;

        emit Transfer(address(0), to, tokenId);
        return tokenId;
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        return _owners[tokenId];
    }

    function checkHasMinted(string memory discordId) public view returns (bool) {
        return discordIdMinted[discordId];
    }
}
