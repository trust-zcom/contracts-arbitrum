const Token = artifacts.require("Token_v3");

module.exports = async (deployer) => {
    const config = require(`../config/${deployer.network}.json`);
    const rescuer = config.rescuer;
    await deployer.deploy(Token);
    const token = await Token.deployed();
    await token.initialize('A', 'a', 1, '0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000001');
    await token.initializeV3(rescuer,'0x0000000000000000000000000000000000000001','0x0000000000000000000000000000000000000001');
}