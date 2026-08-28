// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PassportNFT {
    string public name = "FactorX Commercial Passport";
    string public symbol = "FXPASS";

    mapping(uint256 => address) private _ownerOf;
    mapping(address => uint256) private _ownedToken;
    mapping(address => uint256) private _balanceOf;

    uint256 private _nextId = 1;
    address public minter;
    address public owner;
    string public baseURI;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event PassportMinted(address indexed user, uint256 indexed tokenId);

    error Soulbound();
    error AlreadyHasPassport();
    error Unauthorized();
    error ZeroAddress();

    modifier onlyMinter() {
        if (msg.sender != minter) revert Unauthorized();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setMinter(address _minter) external onlyOwner {
        minter = _minter;
    }

    function setBaseURI(string calldata uri) external onlyOwner {
        baseURI = uri;
    }

    function mint(address to) external onlyMinter returns (uint256) {
        if (to == address(0)) revert ZeroAddress();
        if (_ownedToken[to] != 0) revert AlreadyHasPassport();

        uint256 id = _nextId++;
        _ownerOf[id] = to;
        _ownedToken[to] = id;
        _balanceOf[to] = 1;

        emit Transfer(address(0), to, id);
        emit PassportMinted(to, id);
        return id;
    }

    function balanceOf(address user) external view returns (uint256) {
        return _balanceOf[user];
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address o = _ownerOf[tokenId];
        require(o != address(0), "Nonexistent token");
        return o;
    }

    function tokenOf(address user) external view returns (uint256) {
        return _ownedToken[user];
    }

    function hasPassport(address user) external view returns (bool) {
        return _ownedToken[user] != 0;
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_ownerOf[tokenId] != address(0), "Nonexistent token");
        return baseURI;
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == 0x80ac58cd || interfaceId == 0x5b5e139f || interfaceId == 0x01ffc9a7;
    }

    function transferFrom(address, address, uint256) external pure {
        revert Soulbound();
    }

    function safeTransferFrom(address, address, uint256) external pure {
        revert Soulbound();
    }

    function safeTransferFrom(address, address, uint256, bytes calldata) external pure {
        revert Soulbound();
    }

    function approve(address, uint256) external pure {
        revert Soulbound();
    }

    function setApprovalForAll(address, bool) external pure {
        revert Soulbound();
    }

    function getApproved(uint256) external pure returns (address) {
        return address(0);
    }

    function isApprovedForAll(address, address) external pure returns (bool) {
        return false;
    }
}
