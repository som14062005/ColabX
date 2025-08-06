const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  const Contract = await ethers.getContractFactory("Log");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();

  const deploymentData = {
    abi: JSON.parse(fs.readFileSync("./artifacts/contracts/Log.sol/Log.json")).abi,
    contract: await contract.getAddress(),
  };

  // Save to blockchain/deployments
  const blockchainPath = path.resolve(__dirname, "../deployments/sepolia.json");
  fs.writeFileSync(blockchainPath, JSON.stringify(deploymentData, null, 2));

  // Auto-copy to frontend/src
  const frontendPath = path.resolve(__dirname, "../../frontend/src/contract.json");
  fs.writeFileSync(frontendPath, JSON.stringify(deploymentData, null, 2));

  console.log("✅ Deployment info written to both locations.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
