// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RitualTCGCard is ERC721, ERC721Enumerable, Ownable {
    uint256 private _nextTokenId;
    string private _baseTokenURI;

    uint256 public constant MINT_FEE = 0.01 ether; // 0.01 RITUAL

    mapping(string => bool) public discordIdMinted;

    struct CardMetadata {
        string discordId;
        string discordRole;
        string discordUsername;
    }
    mapping(uint256 => CardMetadata) public cardData;

    constructor(address initialOwner, string memory baseURI) 
        ERC721("Ritual TCG Cards", "RTCG") 
        Ownable(initialOwner) 
    {
        _baseTokenURI = baseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }

    function mintCard(
        address to,
        string memory discordId,
        string memory discordRole,
        string memory discordUsername
    ) public payable returns (uint256) {
        require(msg.value == MINT_FEE, "Incorrect mint fee");
        require(!discordIdMinted[discordId], "Already minted");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        cardData[tokenId] = CardMetadata({
            discordId: discordId,
            discordRole: discordRole,
            discordUsername: discordUsername
        });

        discordIdMinted[discordId] = true;

        return tokenId;
    }

    function checkHasMinted(string memory discordId) public view returns (bool) {
        return discordIdMinted[discordId];
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdraw failed");
    }

    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
