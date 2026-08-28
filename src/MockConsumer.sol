// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICommercialScoreForConsumer {
    function getCommercialScore(address user) external view returns (uint256);
}

interface IFactorCreditForConsumer {
    function outstanding(address user) external view returns (uint256);
    function getAvailableCredit(address user) external view returns (uint256);
}

contract MockConsumer {
    ICommercialScoreForConsumer public immutable scoreContract;
    IFactorCreditForConsumer public immutable credit;

    event BetterTermsOffered(
        address indexed user,
        uint256 score,
        uint256 outstanding,
        uint256 available,
        string message
    );

    constructor(address _score, address _credit) {
        scoreContract = ICommercialScoreForConsumer(_score);
        credit = IFactorCreditForConsumer(_credit);
    }

    function checkAndOfferTerms(address user) external returns (string memory) {
        uint256 score = scoreContract.getCommercialScore(user);
        uint256 debt = credit.outstanding(user);
        uint256 available = credit.getAvailableCredit(user);

        string memory message;
        if (score < 400) {
            message = "Score too low for terms";
        } else if (debt > 0 && available == 0) {
            message = "Line fully drawn. No new offer until repay";
        } else if (debt > 0) {
            message = "Existing advance on file. Offer sized to remaining room";
        } else if (score >= 700) {
            message = "Premium terms: 0% collateral, priority queue";
        } else if (score >= 500) {
            message = "Improved terms: 20% lower collateral";
        } else {
            message = "Standard terms available";
        }

        emit BetterTermsOffered(user, score, debt, available, message);
        return message;
    }
}
