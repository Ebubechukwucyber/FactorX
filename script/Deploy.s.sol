// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ReceivableRegistry.sol";
import "../src/AttestcoinVerifier.sol";
import "../src/CommercialScore.sol";
import "../src/FactorCredit.sol";
import "../src/MockConsumer.sol";

/**
 * @title DeployFactorX
 * @notice Deploys the full FactorX stack in the correct order.
 *
 * Usage:
 *   forge script script/Deploy.s.sol:DeployFactorX --rpc-url $CREDITCOIN_TESTNET --broadcast
 */
contract DeployFactorX is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 1. Registry first (no dependencies)
        ReceivableRegistry registry = new ReceivableRegistry();
        console.log("ReceivableRegistry:", address(registry));

        // 2. Verifier (needs registry)
        AttestcoinVerifier verifier = new AttestcoinVerifier(address(registry));
        console.log("AttestcoinVerifier:", address(verifier));

        // Wire verifier as the only writer
        registry.setVerifier(address(verifier));

        // 3. Score (needs registry)
        CommercialScore score = new CommercialScore(address(registry));
        console.log("CommercialScore:", address(score));

        // 4. Credit engine (needs score + registry)
        FactorCredit credit = new FactorCredit(address(score), address(registry));
        console.log("FactorCredit:", address(credit));

        // 5. Mock consumer for demo composability
        MockConsumer consumer = new MockConsumer(address(score));
        console.log("MockConsumer:", address(consumer));

        vm.stopBroadcast();

        console.log("\n=== FactorX Deployment Complete ===");
        console.log("Passport (CommercialScore):", address(score));
        console.log("Use these addresses in the frontend and demo.");
    }
}
