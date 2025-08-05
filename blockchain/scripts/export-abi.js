const fs = require("fs");
const path = require("path");

async function exportAbi() {
  const contracts = ["Log"]; // Add your contract names here
  const sourceFolder = path.join(__dirname, "..", "artifacts", "contracts");
  const destFolder = path.join(__dirname, "..", "abis");

  if (!fs.existsSync(destFolder)) {
    fs.mkdirSync(destFolder);
  }

  for (const contract of contracts) {
    const artifactPath = path.join(sourceFolder, `${contract}.sol`, `${contract}.json`);
    const raw = fs.readFileSync(artifactPath, "utf8");
    const artifact = JSON.parse(raw);
    const abi = artifact.abi;

    fs.writeFileSync(
      path.join(destFolder, `${contract}.json`),
      JSON.stringify(abi, null, 2)
    );

    console.log(`✅ ABI for ${contract} exported.`);
  }
}

exportAbi().catch((err) => {
  console.error("❌ Error exporting ABI:", err);
});
