// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Invoice + confidence sidecar. Does not replace ReceivableRegistry.
contract CommercialIntent {
    struct Intent {
        bytes32 invoiceId;
        uint8 confidence; // 2 = invoice linked, 1 = payment only
        address payer;
        address beneficiary;
    }

    address public owner;
    address public verifier;
    mapping(bytes32 => Intent) public byTx;
    mapping(address => bytes32[]) public invoicesOf;

    error Unauthorized();
    error ZeroAddress();

    event IntentRecorded(bytes32 indexed sourceTxHash, bytes32 invoiceId, uint8 confidence);

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyVerifier() {
        if (msg.sender != verifier) revert Unauthorized();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setVerifier(address v) external onlyOwner {
        if (v == address(0)) revert ZeroAddress();
        verifier = v;
    }

    function recordIntent(
        bytes32 sourceTxHash,
        bytes32 invoiceId,
        uint8 confidence,
        address payer,
        address beneficiary
    ) external onlyVerifier {
        byTx[sourceTxHash] = Intent(invoiceId, confidence, payer, beneficiary);
        if (invoiceId != bytes32(0)) {
            invoicesOf[beneficiary].push(invoiceId);
        }
        emit IntentRecorded(sourceTxHash, invoiceId, confidence);
    }

    function getIntent(bytes32 sourceTxHash) external view returns (Intent memory) {
        return byTx[sourceTxHash];
    }
}
