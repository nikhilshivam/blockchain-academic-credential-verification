const hre = require("hardhat");

async function main() {
  const Registry = await hre.ethers.getContractFactory("AcademicCredentialRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  console.log("AcademicCredentialRegistry deployed to:");
  console.log(await registry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
