const Web3EthAbi = require('web3-eth-abi');
const ZUSD = artifacts.require('ZUSD');
const GYEN = artifacts.require('GYEN');
const Token = artifacts.require('ArbToken_v2');


module.exports = async (deployer, network) => {

    if (network != "test" && network != "coverage") {
        //const newName = 'modified name ';
        const [initializeV2] = Token.abi.filter((f) => f.name === 'initializeV2');

        const config = require(`../config/${deployer.network}.json`);
        const deployeraddress = config.deployer;

        const newNameGyen = config.name_gyen;
        const newSymbolGyen = config.symbol_gyen;
        const newNameZusd = config.name_zusd;
        const newSymbolZusd = config.symbol_zusd;
        console.log('\ndeployer: ', deployeraddress);
        console.log('GYEN newName: ', newNameGyen);
        console.log('GYEN newSymbol: ', newSymbolGyen);
        console.log('ZUSD newName: ', newNameZusd);
        console.log('ZUSD newSymbol: ', newSymbolZusd);

        const token = await Token.deployed();
        const tokenV2address = token.address;
        console.log('Token_v2 Address: ', tokenV2address);
        const zusd = await ZUSD.deployed();
        const gyen = await GYEN.deployed();

        if(
            newNameZusd != '' && newSymbolZusd != ''
        ){

            console.log('\nZUSD Address: ', zusd.address);
    
            console.log('\nZUSD-upgradeToAndCall ... ...');
            let receipt = await zusd.upgradeToAndCall(tokenV2address, Web3EthAbi.encodeFunctionCall(initializeV2,[newNameZusd, newSymbolZusd]));
            if(network == "arbitrum"){
                console.log(`https://arbiscan.io/tx/${receipt.tx}`);
            } else if (network == "arbitrumN"){
                console.log(`https://goerli.arbiscan.io/tx/${receipt.tx}`);
            }
        }
        
        if(
            newNameGyen != '' && newSymbolGyen != ''
        ){
            console.log('GYEN Address: ', gyen.address);
            console.log('\nGYEN-upgradeToAndCall ... ...');
            receipt = await gyen.upgradeToAndCall(tokenV2address, Web3EthAbi.encodeFunctionCall(initializeV2,[newNameGyen, newSymbolGyen]));
            if(network == "arbitrum"){
                console.log(`https://arbiscan.io/tx/${receipt.tx}`);
            } else if (network == "arbitrumN"){
                console.log(`https://goerli.arbiscan.io/tx/${receipt.tx}`);
            }
        }

        if(
            newNameZusd != '' ||
             newSymbolZusd != '' ||
              newNameGyen != '' ||
               newSymbolGyen != ''
        ){
            console.log('\nZUSD change deployer ... ...');
            receipt = await zusd.changeAdmin(deployeraddress);
            if(network == "arbitrum"){
                console.log(`https://arbiscan.io/tx/${receipt.tx}`);
            } else if (network == "arbitrumN"){
                console.log(`https://goerli.arbiscan.io/tx/${receipt.tx}`);
            }
    
            console.log('Upgrade ZUSD to V2 successfully end.\n');

            console.log('\nGYEN change deployer ... ...');
            receipt = await gyen.changeAdmin(deployeraddress);
            if(network == "arbitrum"){
                console.log(`https://arbiscan.io/tx/${receipt.tx}`);
            } else if (network == "arbitrumN"){
                console.log(`https://goerli.arbiscan.io/tx/${receipt.tx}`);
            }
    
            console.log('Upgrade GYEN to V2 successfully end.\n');
        }
    }
}