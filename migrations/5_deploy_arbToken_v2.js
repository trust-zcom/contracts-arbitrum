const Token = artifacts.require("ArbToken_v2");

module.exports = async (deployer) => {
    await deployer.deploy(Token);
    const token = await Token.deployed();
    await token.initialize('A', 'a', 1, '0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000001');
    await token.initializeV2('A', 'a');
}