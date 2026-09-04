// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title PassportNFT
 * @notice Soulbound (non-transferable) NFT that represents a user's
 *         Commercial Cashflow Passport in FactorX.
 *
 * - One passport per address
 * - Cannot be transferred or approved
 * - Minted the first time a user receives a verified commercial payment
 * - Metadata can later point to score / volume (or stay simple for the hackathon)
 *
 * This gives judges and users a tangible identity object.
 */

contract PassportNFT {
    // ============ ERC-721 minimal surface ============
    string public name = "FactorX Commercial Passport";
    string public symbol = "FXPASS";

    mapping(uint256 => address) private _ownerOf;
    mapping(address => uint256) private _ownedToken; // one passport per user
    mapping(address => uint256) private _balanceOf;

    uint256 private _nextId = 1;

    address public minter; // AttestcoinVerifier or a dedicated minter role
    address public owner;

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

    /**
     * @notice Mint a soulbound passport for a user.
     *         Called when they receive their first verified commercial payment.
     */
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

    // ============ Views ============
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
        if (_ownerOf[tokenId] == address(0)) revert Unauthorized();
        return string(
            abi.encodePacked("https://factorx.vercel.app/api/passport/", _u(tokenId))
        );
    }

    function _u(uint256 v) private pure returns (string memory) {
        if (v == 0) return "0";
        uint256 j = v;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory b = new bytes(len);
        while (v != 0) {
            len--;
            b[len] = bytes1(uint8(48 + (v % 10)));
            v /= 10;
        }
        return string(b);
    }

    // ============ Soulbound: block all transfers & approvals ============
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
