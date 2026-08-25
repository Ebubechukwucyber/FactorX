// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ReceivableRegistry
 * @notice Append-only store of verified commercial payments.
 *         Only AttestcoinVerifier can write.
 *
 * Complexity progression:
 *   L2: Basic record storage
 *   L3: History queries + total volume tracking
 *   L5: Filtering by event type / counterparty diversity helpers
 */

contract ReceivableRegistry {
    // ============ Structs ============
    struct Receivable {
        address payer;
        uint256 amount;
        bytes32 sourceTxHash;
        uint256 timestamp;
        uint8 eventType; // 0 = ERC20, 1 = InvoicePaid
    }

    // ============ State ============
    address public verifier;
    address public owner;

    // user => list of verified receivables
    mapping(address => Receivable[]) private _receivables;

    // user => total verified volume (for quick score inputs)
    mapping(address => uint256) public totalVolume;

    // user => number of distinct payers (simple diversity proxy)
    mapping(address => mapping(address => bool)) private _seenPayers;
    mapping(address => uint256) public uniquePayerCount;

    // ============ Events ============
    event ReceivableRecorded(
        address indexed beneficiary,
        address indexed payer,
        uint256 amount,
        bytes32 sourceTxHash,
        uint8 eventType
    );

    // ============ Errors ============
    error OnlyVerifier();
    error Unauthorized();

    modifier onlyVerifier() {
        if (msg.sender != verifier) revert OnlyVerifier();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setVerifier(address _verifier) external onlyOwner {
        verifier = _verifier;
    }

    /**
     * @notice Called exclusively by AttestcoinVerifier after successful proof.
     */
    function recordVerifiedPayment(
        address beneficiary,
        address payer,
        uint256 amount,
        bytes32 sourceTxHash,
        uint8 eventType
    ) external onlyVerifier {
        _receivables[beneficiary].push(
            Receivable({
                payer: payer,
                amount: amount,
                sourceTxHash: sourceTxHash,
                timestamp: block.timestamp,
                eventType: eventType
            })
        );

        totalVolume[beneficiary] += amount;

        if (!_seenPayers[beneficiary][payer]) {
            _seenPayers[beneficiary][payer] = true;
            uniquePayerCount[beneficiary] += 1;
        }

        emit ReceivableRecorded(beneficiary, payer, amount, sourceTxHash, eventType);
    }

    // ============ Views (public for composability) ============

    function getReceivables(address user) external view returns (Receivable[] memory) {
        return _receivables[user];
    }

    function getReceivableCount(address user) external view returns (uint256) {
        return _receivables[user].length;
    }

    function getLatestReceivable(address user) external view returns (Receivable memory) {
        uint256 len = _receivables[user].length;
        require(len > 0, "No receivables");
        return _receivables[user][len - 1];
    }
}
