// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPassport {
    function hasPassport(address user) external view returns (bool);
    function mint(address to) external returns (uint256);
}

interface IIntent {
    function recordIntent(
        bytes32 sourceTxHash,
        bytes32 invoiceId,
        uint8 confidence,
        address payer,
        address beneficiary
    ) external;
}

contract AttestcoinVerifier {
    uint32 public constant SEPOLIA_CHAIN_KEY = 1;

    event PaymentVerified(
        address indexed beneficiary,
        address indexed payer,
        uint256 amount,
        bytes32 sourceTxHash,
        uint256 timestamp,
        uint8 eventType,
        bytes32 invoiceId,
        uint8 confidence,
        uint256 passportId
    );

    address public immutable registry;
    address public immutable passport;
    address public immutable intent;
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

    constructor(address _registry, address _passport, address _intent) {
        if (_registry == address(0) || _passport == address(0) || _intent == address(0)) {
            revert ZeroAddress();
        }
        registry = _registry;
        passport = _passport;
        intent = _intent;
        owner = msg.sender;
    }

    function verifyAndRecord(
        bytes calldata proof,
        bytes32 sourceTxHash,
        uint8 eventType,
        address beneficiary,
        address payer,
        uint256 amount,
        bytes32 invoiceId
    ) external {
        if (processedProofs[sourceTxHash]) revert ProofAlreadyUsed();
        if (eventType > 1) revert InvalidEventType();
        if (beneficiary == address(0) || payer == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (beneficiary == payer) revert SelfTransfer();
        proof;

        processedProofs[sourceTxHash] = true;

        uint8 confidence = invoiceId != bytes32(0) ? 2 : 1;

        uint256 passportId;
        if (!IPassport(passport).hasPassport(beneficiary)) {
            passportId = IPassport(passport).mint(beneficiary);
        }

        IIntent(intent).recordIntent(sourceTxHash, invoiceId, confidence, payer, beneficiary);

        emit PaymentVerified(
            beneficiary,
            payer,
            amount,
            sourceTxHash,
            block.timestamp,
            eventType,
            invoiceId,
            confidence,
            passportId
        );

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
