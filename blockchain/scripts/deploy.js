const hre = require("hardhat");

async function main() {
    const Log = await hre.ethers.getContractFactory("Log");
    const log = await Log.deploy(); // ⬅️ No need for .deployed()

    await log.waitForDeployment(); // ✅ Ethers v6 replacement for `.deployed()`

    console.log(`Log deployed to: ${await log.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});