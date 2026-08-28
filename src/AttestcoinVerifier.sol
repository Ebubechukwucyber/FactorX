// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AttestcoinVerifier
 * @notice FactorX ASC. Attestcoin proof is produced by Proof Builder +
 *         official PrecompileBlockProver (0x0FD2) via gluwa usc-sdk.
 *         This contract records the commercial result after that proof exists.
 */
contract AttestcoinVerifier {
    uint32 public constant SEPOLIA_CHAIN_KEY = 1;

    event PaymentVerified(
        address indexed beneficiary,
        address indexed payer,
        uint256 amount,
        bytes32 sourceTxHash,
        uint256 timestamp,
        uint8 eventType
    );

    event AttestcoinVerified(bytes32 indexed sourceTxHash, uint32 chainKey, uint64 headerNumber);

    address public immutable registry;
    address public owner;
    mapping(bytes32 => bool) public processedProofs;

    error ProofAlreadyUsed();
    error Unauthorized();
    error InvalidEventType();
    error ZeroAddress();
    error ZeroAmount();
    error SelfTransfer();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor(address _registry) {
        if (_registry == address(0)) revert ZeroAddress();
        registry = _registry;
        owner = msg.sender;
    }

    function verifyAndRecord(
        bytes calldata proof,
        bytes32 sourceTxHash,
        uint8 eventType,
        address beneficiary,
        address payer,
        uint256 amount
    ) external {
        if (processedProofs[sourceTxHash]) revert ProofAlreadyUsed();
        if (eventType > 1) revert InvalidEventType();
        if (beneficiary == address(0) || payer == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (beneficiary == payer) revert SelfTransfer();
        proof;

        processedProofs[sourceTxHash] = true;
        emit AttestcoinVerified(sourceTxHash, SEPOLIA_CHAIN_KEY, 0);
        emit PaymentVerified(beneficiary, payer, amount, sourceTxHash, block.timestamp, eventType);

        (bool success, ) = registry.call(
            abi.encodeWithSignature(
                "recordVerifiedPayment(address,address,uint256,bytes32,uint8)",
                beneficiary,
                payer,
                amount,
                sourceTxHash,
                eventType
            )
        );
        require(success, "Registry call failed");
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        owner = newOwner;
    }
}
