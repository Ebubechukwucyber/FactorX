// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ReceivableRegistry.sol";
import "../src/AttestcoinVerifier.sol";
import "../src/CommercialScore.sol";
import "../src/FactorCredit.sol";
import "../src/MockConsumer.sol";
import "../src/PassportNFT.sol";

contract DeployFactorX is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);

        vm.startBroadcast(deployerPrivateKey);

        ReceivableRegistry registry = new ReceivableRegistry();
        console.log("ReceivableRegistry:", address(registry));

        AttestcoinVerifier verifier = new AttestcoinVerifier(address(registry));
        console.log("AttestcoinVerifier:", address(verifier));

        registry.setVerifier(address(verifier));

        CommercialScore score = new CommercialScore(address(registry));
        console.log("CommercialScore:", address(score));

        FactorCredit credit = new FactorCredit(address(score), address(registry));
        console.log("FactorCredit:", address(credit));

        PassportNFT passport = new PassportNFT();
        console.log("PassportNFT:", address(passport));
        passport.setMinter(address(verifier));

        MockConsumer consumer = new MockConsumer(address(score));
        console.log("MockConsumer:", address(consumer));

        vm.stopBroadcast();

        console.log("");
        console.log("========== FactorX Deployment Complete ==========");
        console.log("ReceivableRegistry :", address(registry));
        console.log("AttestcoinVerifier :", address(verifier));
        console.log("CommercialScore    :", address(score));
        console.log("FactorCredit       :", address(credit));
        console.log("PassportNFT        :", address(passport));
        console.log("MockConsumer       :", address(consumer));
        console.log("=================================================");
    }
}