// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICommercialScoreForCredit {
    function getCommercialScore(address user) external view returns (uint256);
}

interface IReceivableRegistryForCredit {
    function totalVolume(address user) external view returns (uint256);
}

contract FactorCredit {
    ICommercialScoreForCredit public immutable scoreContract;
    IReceivableRegistryForCredit public immutable registry;

    address public owner;

    mapping(address => uint256) public outstanding;

    uint256 public constant MIN_SCORE_FOR_CREDIT = 400;
    uint256 public constant MAX_ADVANCE_BPS = 3000;

    event AdvanceOpened(address indexed user, uint256 amount, uint256 score);
    event AdvanceRepaid(address indexed user, uint256 amount);
    event AdvanceClosed(address indexed user);

    error ScoreTooLow();
    error ExceedsLimit();
    error NothingToRepay();
    error Unauthorized();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor(address _score, address _registry) {
        scoreContract = ICommercialScoreForCredit(_score);
        registry = IReceivableRegistryForCredit(_registry);
        owner = msg.sender;
    }

    function requestAdvance(uint256 requested) external {
        uint256 score = scoreContract.getCommercialScore(msg.sender);
        if (score < MIN_SCORE_FOR_CREDIT) revert ScoreTooLow();

        uint256 volume = registry.totalVolume(msg.sender);
        uint256 maxAdvance = (volume * MAX_ADVANCE_BPS) / 10_000;
        uint256 debt = outstanding[msg.sender];
        uint256 available = maxAdvance > debt ? maxAdvance - debt : 0;

        uint256 amount = requested > available ? available : requested;
        if (amount == 0) revert ExceedsLimit();

        outstanding[msg.sender] += amount;

        emit AdvanceOpened(msg.sender, amount, score);
    }

    function repay(uint256 amount) external {
        uint256 debt = outstanding[msg.sender];
        if (debt == 0) revert NothingToRepay();

        uint256 pay = amount > debt ? debt : amount;
        outstanding[msg.sender] -= pay;

        emit AdvanceRepaid(msg.sender, pay);

        if (outstanding[msg.sender] == 0) {
            emit AdvanceClosed(msg.sender);
        }
    }

    function getAvailableCredit(address user) external view returns (uint256) {
        uint256 score = scoreContract.getCommercialScore(user);
        if (score < MIN_SCORE_FOR_CREDIT) return 0;

        uint256 volume = registry.totalVolume(user);
        uint256 maxAdvance = (volume * MAX_ADVANCE_BPS) / 10_000;
        uint256 debt = outstanding[user];

        return maxAdvance > debt ? maxAdvance - debt : 0;
    }
}
