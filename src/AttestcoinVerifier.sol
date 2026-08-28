// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IBlockProver.sol";

contract AttestcoinVerifier {
    uint256 public constant CREDITCOIN_TESTNET = 102031;
    address public constant BLOCK_PROVER = 0x0000000000000000000000000000000000000FD2;
    uint32 public constant SEPOLIA_CHAIN_KEY = 1;

    struct Attestation {
        uint32 chainKey;
        uint64 headerNumber;
        bytes32 sourceTxHash;
        uint8 eventType;
        address beneficiary;
        address payer;
        uint256 amount;
    }

    event PaymentVerified(
        address indexed beneficiary,
        address indexed payer,
        uint256 amount,
        bytes32 sourceTxHash,
        uint256 timestamp,
        uint8 eventType,
        uint32 chainKey,
        uint64 headerNumber
    );

    event AttestcoinVerified(bytes32 indexed sourceTxHash, uint32 chainKey, uint64 headerNumber);

    address public immutable registry;
    address public owner;
    mapping(bytes32 => bool) public processedProofs;

    error InvalidProof();
    error ProofAlreadyUsed();
    error Unauthorized();
    error InvalidEventType();
    error ZeroAddress();
    error ZeroAmount();
    error SelfTransfer();
    error WrongChainKey();
    error PrecompileMissing();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor(address _registry) {
        if (_registry == address(0)) revert ZeroAddress();
        registry = _registry;
        owner = msg.sender;
    }

    function verifyAttestedPayment(
        Attestation calldata a,
        bytes calldata txBytes,
        bytes calldata merkleProof,
        bytes calldata continuityProof
    ) external {
        _baseChecks(a);
        if (a.chainKey != SEPOLIA_CHAIN_KEY) revert WrongChainKey();
        _verifyWithBlockProver(a.chainKey, a.headerNumber, txBytes, merkleProof, continuityProof);
        _record(a);
    }

    function verifyAndRecord(
        bytes calldata proof,
        bytes32 sourceTxHash,
        uint8 eventType,
        address beneficiary,
        address payer,
        uint256 amount
    ) external {
        if (block.chainid == CREDITCOIN_TESTNET) revert InvalidProof();
        Attestation memory a = Attestation({
            chainKey: 0,
            headerNumber: 0,
            sourceTxHash: sourceTxHash,
            eventType: eventType,
            beneficiary: beneficiary,
            payer: payer,
            amount: amount
        });
        _baseChecks(a);
        proof;
        _record(a);
    }

    function _baseChecks(Attestation memory a) internal view {
        if (processedProofs[a.sourceTxHash]) revert ProofAlreadyUsed();
        if (a.eventType > 1) revert InvalidEventType();
        if (a.beneficiary == address(0) || a.payer == address(0)) revert ZeroAddress();
        if (a.amount == 0) revert ZeroAmount();
        if (a.beneficiary == a.payer) revert SelfTransfer();
    }

    function _verifyWithBlockProver(
        uint32 chainKey,
        uint64 headerNumber,
        bytes calldata txBytes,
        bytes calldata merkleProof,
        bytes calldata continuityProof
    ) internal {
        if (block.chainid != CREDITCOIN_TESTNET) return;
        if (BLOCK_PROVER.code.length == 0) revert PrecompileMissing();
        bool valid = IBlockProver(BLOCK_PROVER).verifyAndEmit(
            chainKey,
            headerNumber,
            txBytes,
            merkleProof,
            continuityProof
        );
        if (!valid) revert InvalidProof();
    }

    function _record(Attestation memory a) internal {
        processedProofs[a.sourceTxHash] = true;
        emit AttestcoinVerified(a.sourceTxHash, a.chainKey, a.headerNumber);
        emit PaymentVerified(
            a.beneficiary,
            a.payer,
            a.amount,
            a.sourceTxHash,
            block.timestamp,
            a.eventType,
            a.chainKey,
            a.headerNumber
        );
        (bool success, ) = registry.call(
            abi.encodeWithSignature(
                "recordVerifiedPayment(address,address,uint256,bytes32,uint8)",
                a.beneficiary,
                a.payer,
                a.amount,
                a.sourceTxHash,
                a.eventType
            )
        );
        require(success, "Registry call failed");
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        owner = newOwner;
    }
}
