
const { providers, Wallet } = require('ethers')
const { getL2Network, L1ToL2MessageStatus } = require('@arbitrum/sdk')
const { arbLog, requireEnvVariables } = require('arb-shared-dependencies')
const {
  AdminErc20Bridger,
} = require('@arbitrum/sdk/dist/lib/assetBridger/erc20Bridger')
const { expect } = require('chai')
require('dotenv').config()
requireEnvVariables(['DEVNET_PRIVKEY', 'L1RPC', 'L2RPC'])

/**
 * Set up: instantiate L1 / L2 wallets connected to providers
 */
const walletPrivateKey = process.env.DEVNET_PRIVKEY

const l1Provider = new providers.JsonRpcProvider(process.env.L1RPC)
const l2Provider = new providers.JsonRpcProvider(process.env.L2RPC)

const l1Wallet = new Wallet(walletPrivateKey, l1Provider)
//const l2Wallet = new Wallet(walletPrivateKey, l2Provider)

/**
 * Set the initial supply of L1 token that we want to bridge
 * Note that you can change the value
 */

const main = async () => {
  await arbLog(
    'Setting Up Your Token With The Generic Custom Gateway Using Arbitrum SDK Library'
  )

  /**
   * Use l2Network to create an Arbitrum SDK AdminErc20Bridger instance
   * We'll use AdminErc20Bridger for its convenience methods around registering tokens to the custom gateway
   */
  const l2Network = await getL2Network(l2Provider)
  const adminTokenBridger = new AdminErc20Bridger(l2Network)

  const l1Gatewayt = l2Network.tokenBridge.l1CustomGateway
  const l1Routert = l2Network.tokenBridge.l1GatewayRouter
  const l2Gatewayt = l2Network.tokenBridge.l2CustomGateway
  console.log({ l1Gatewayt, l1Routert, l2Gatewayt })

  const l1Gateway = '0x902b3E5f8F19571859F4AB1003B960a5dF693aFF'
  const l1Router = '0xcE18836b233C83325Cc8848CA4487e94C6288264'
  const l2Gateway = '0x8Ca1e1AC0f260BC4dA7Dd60aCA6CA66208E642C5'

  console.log('arbitrum addresses:')
  console.log({ l1Gateway, l1Router, l2Gateway })

  const gyenl1 = process.env.L1_GYEN
  const gyenl2 = process.env.L2_GYEN
  console.log({ gyenl1, gyenl2 })

  const network1 = await l1Provider.getNetwork();
  console.log('Connected to network L1:', network1);
  const network = await l2Provider.getNetwork();
  console.log('Connected to network L2:', network);

  console.log('Registering custom token GYEN on L2:')
  /**
   * ٍRegister custom token on our custom gateway
   */
  const registerTokenTx = await adminTokenBridger.registerCustomToken(
    gyenl1,
    gyenl2,
    l1Wallet,
    l2Provider
  )

  const registerTokenRec = await registerTokenTx.wait()
  console.log(
    `Registering gyen token txn confirmed on L1! 🙌 L1 receipt is: ${registerTokenRec.transactionHash}`
  )

  /**
   * The L1 side is confirmed; now we listen and wait for the for the Sequencer to include the L2 side; we can do this by computing the expected txn hash of the L2 transaction.
   * To compute this txn hash, we need our message's "sequence numbers", unique identifiers of each L1 to L2 message. We'll fetch them from the event logs with a helper method
   */
  const l1ToL2Msgs = await registerTokenRec.getL1ToL2Messages(l2Provider)

  /**
   * In principle, a single L1 txn can trigger any number of L1-to-L2 messages (each with its own sequencer number).
   * In this case, the registerTokenOnL2 method created 2 L1-to-L2 messages; (1) one to set the L1 token to the Custom Gateway via the Router, and (2) another to set the L1 token to its L2 token address via the Generic-Custom Gateway
   * Here, We check if both messages are redeemed on L2
   */
  expect(l1ToL2Msgs.length, 'Should be 2 messages.').to.eq(2)

  const setTokenTx = await l1ToL2Msgs[0].waitForStatus()
  expect(setTokenTx.status, 'Set token not redeemed.').to.eq(
    L1ToL2MessageStatus.REDEEMED
  )
  const setGateways = await l1ToL2Msgs[1].waitForStatus()
  expect(setGateways.status, 'Set gateways not redeemed.').to.eq(
    L1ToL2MessageStatus.REDEEMED
  )

  const zusdl1 = process.env.L1_ZUSD
  const zusdl2 = process.env.L2_ZUSD
  console.log({ zusdl1, zusdl2 })

  console.log('Registering custom token ZUSD on L2:')
  /**
   * ٍRegister custom token on our custom gateway
   */
  const registerTokenTx1 = await adminTokenBridger.registerCustomToken(
    zusdl1,
    zusdl2,
    l1Wallet,
    l2Provider
  )

  const registerTokenRec1 = await registerTokenTx1.wait()
  console.log(
    `Registering zusd token txn confirmed on L1! 🙌 L1 receipt is: ${registerTokenRec1.transactionHash}`
  )

  /**
   * The L1 side is confirmed; now we listen and wait for the for the Sequencer to include the L2 side; we can do this by computing the expected txn hash of the L2 transaction.
   * To compute this txn hash, we need our message's "sequence numbers", unique identifiers of each L1 to L2 message. We'll fetch them from the event logs with a helper method
   */
  const l1ToL2Msgs1 = await registerTokenRec1.getL1ToL2Messages(l2Provider)

  /**
   * In principle, a single L1 txn can trigger any number of L1-to-L2 messages (each with its own sequencer number).
   * In this case, the registerTokenOnL2 method created 2 L1-to-L2 messages; (1) one to set the L1 token to the Custom Gateway via the Router, and (2) another to set the L1 token to its L2 token address via the Generic-Custom Gateway
   * Here, We check if both messages are redeemed on L2
   */
  expect(l1ToL2Msgs1.length, 'Should be 2 messages.').to.eq(2)

  const setTokenTx1 = await l1ToL2Msgs1[0].waitForStatus()
  expect(setTokenTx1.status, 'Set token not redeemed.').to.eq(
    L1ToL2MessageStatus.REDEEMED
  )
  const setGateways1 = await l1ToL2Msgs1[1].waitForStatus()
  expect(setGateways1.status, 'Set gateways not redeemed.').to.eq(
    L1ToL2MessageStatus.REDEEMED
  )

  console.log(
    'Your custom token is now registered on our custom gateway 🥳  Go ahead and make the deposit!'
  )
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
