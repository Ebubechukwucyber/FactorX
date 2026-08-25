// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IReceivableRegistryForScore {
    function getReceivableCount(address user) external view returns (uint256);
    function totalVolume(address user) external view returns (uint256);
    function uniquePayerCount(address user) external view returns (uint256);
    function getLatestReceivable(address user) external view returns (
        address payer,
        uint256 amount,
        bytes32 sourceTxHash,
        uint256 timestamp,
        uint8 eventType
    );
}

contract CommercialScore {
    IReceivableRegistryForScore public immutable registry;

    uint256 public constant BASE_SCORE = 300;
    uint256 public constant MAX_SCORE = 950;
    uint256 public constant POINTS_PER_PAYMENT = 25;
    uint256 public constant POINTS_PER_UNIQUE_PAYER = 15;
    uint256 public constant VOLUME_DIVISOR = 1e18;

    event ScoreUpdated(address indexed user, uint256 newScore);

    constructor(address _registry) {
        registry = IReceivableRegistryForScore(_registry);
    }

    function getCommercialScore(address user) public view returns (uint256) {
        uint256 count = registry.getReceivableCount(user);
        if (count == 0) return BASE_SCORE;

        uint256 volume = registry.totalVolume(user);
        uint256 uniquePayers = registry.uniquePayerCount(user);

        (, , , uint256 latestTs, ) = registry.getLatestReceivable(user);
        uint256 age = block.timestamp > latestTs ? block.timestamp - latestTs : 0;
        uint256 recencyBonus = age < 30 days ? 50 : (age < 90 days ? 20 : 0);

        uint256 raw = BASE_SCORE
            + (count * POINTS_PER_PAYMENT)
            + (uniquePayers * POINTS_PER_UNIQUE_PAYER)
            + (volume / VOLUME_DIVISOR)
            + recencyBonus;

        return raw > MAX_SCORE ? MAX_SCORE : raw;
    }

    function getScoreBreakdown(address user) external view returns (
        uint256 score,
        uint256 paymentCount,
        uint256 totalVol,
        uint256 uniquePayers,
        uint256 recencyBonus
    ) {
        paymentCount = registry.getReceivableCount(user);
        totalVol = registry.totalVolume(user);
        uniquePayers = registry.uniquePayerCount(user);

        uint256 ageBonus = 0;
        if (paymentCount > 0) {
            (, , , uint256 latestTs, ) = registry.getLatestReceivable(user);
            uint256 age = block.timestamp > latestTs ? block.timestamp - latestTs : 0;
            ageBonus = age < 30 days ? 50 : (age < 90 days ? 20 : 0);
        }

        score = getCommercialScore(user);
        recencyBonus = ageBonus;
    }
}
