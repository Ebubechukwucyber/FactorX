// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICommercialScoreForConsumer {
    function getCommercialScore(address user) external view returns (uint256);
}

contract MockConsumer {
    ICommercialScoreForConsumer public immutable passport;

    event BetterTermsOffered(address indexed user, uint256 score, string message);

    constructor(address _passport) {
        passport = ICommercialScoreForConsumer(_passport);
    }

    function checkAndOfferTerms(address user) external returns (string memory) {
        uint256 score = passport.getCommercialScore(user);

        string memory message;
        if (score >= 700) {
            message = "Premium terms unlocked: 0% collateral, priority queue";
        } else if (score >= 500) {
            message = "Improved terms: 20% lower collateral requirement";
        } else if (score >= 400) {
            message = "Standard terms available";
        } else {
            message = "Score too low for improved terms";
        }

        emit BetterTermsOffered(user, score, message);
        return message;
    }
}
