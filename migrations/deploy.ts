const anchor = require("@coral-xyz/anchor");
const path = require("path");
const fs = require("fs");

module.exports = async function (provider) {
  // Configure client to use the provider.
  anchor.setProvider(provider);

  // Load the program ID from the IDL or a file
  const idlPath = path.resolve(__dirname, '../target/idl/crowdfunding.json');
  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
  const programId = new anchor.web3.PublicKey(idl.metadata.address);

  // Load the program
  const program = new anchor.Program(idl, programId);

  // Get the provider
  const { connection, wallet } = provider;

  // Deploy the program (this assumes you have a built program in the target directory)
  const programPath = path.resolve(__dirname, '../target/deploy/crowdfunding.so');
  const programId = await anchor.deploy({
    programPath,
    keypair: wallet.payer,
    provider,
  });

  // Print the program ID
  console.log(`Program deployed to: ${programId.toBase58()}`);
};
