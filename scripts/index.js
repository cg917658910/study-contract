const ethers = require("ethers");
const chalk = require("chalk");
const JSBI = require('jsbi')
const erc20 = require('./abis/erc20.json')
const RPCServerAddress = "http://localhost:8545"
const provider = new ethers.JsonRpcProvider(RPCServerAddress)
const wallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);
const walletAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
const usdtAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7"
const daiAddress = "0x6b175474e89094c44da98b954eedeac495271d0f"
const usdtToken = new ethers.Contract(usdtAddress, erc20, wallet);
const daiToken = new ethers.Contract(daiAddress, erc20, wallet);

const balanceUSDT = async () => {
    const balance = await usdtToken.balanceOf(walletAddress)
    console.log("usdt balance:", balance.toString())
}
const balanceDAI = async () => {
    const balance = await daiToken.balanceOf(walletAddress)
    console.log("dai balance:", balance.toString())
}

const approveUSDT = async (amountIn, address) => {
    console.log(toHex(amountIn))
    const tx = await usdtToken.approve(
        address,
        toHex(amountIn), // max approve amount
    );
    tx.wait(1);
    console.log(chalk.green(`Successfully approve ${amountIn} USDT to ${address} ,hash: ${tx.hash}`));
    return tx;
}
const allowanceUSDT = async (address) => {
    const allowance = await usdtToken.allowance(
        walletAddress,
        address,
    );
    console.log("usdt allowance: ", allowance.toString());
    return allowance;
}

function toHex(bigintIsh) {
    var bigInt = JSBI.BigInt(bigintIsh);
    var hex = bigInt.toString(16);

    if (hex.length % 2 !== 0) {
        hex = "0" + hex;
    }

    return "0x" + hex;
}


const getBalance = async () => {
    const balance = await provider.getBalance(walletAddress)
    console.log("eth balance: ", balance.toString())
}

const getContractMetadata = (contractName) => {
    const artifactsPath = `../artifacts/contracts/${contractName}.sol/${contractName}.json` // Change this for different path
    const metadata = require(artifactsPath)
    return metadata
}

const misesSwapRouter = async () => {
    const address = "0xd9abC93F81394Bd161a1b24B03518e0a570bDEAd"
    const metadata = getContractMetadata("MisesSwapRouter")
    const contract = new ethers.Contract(address, metadata.abi, wallet)
    //const isHealth = contract.health.staticCall()
    const funcName = "externalSwap"
    const { fromToken, toToken, fromTokenAmount, swapTarget, approveTarget, targetCallData, value } = buildNativeToUSDT()
    //await approveUSDT(fromTokenAmount, address)
    const data = contract.interface.encodeFunctionData(
        funcName,
        [fromToken, toToken, fromTokenAmount, swapTarget, approveTarget, targetCallData]
    );
    const tx = {
        from: walletAddress,
        maxFeePerGas: 100000000000,
        maxPriorityFeePerGas: 100000000000,
        value: value,
        to: address,
        data: data,
        gasLimit: 241310
    }
    const result = await wallet.sendTransaction(tx);
    console.log("result: ", result.hash)
    return result.hash
}

const buildNativeToUSDT = () => {
    const fromToken = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    const toToken = "0xdac17f958d2ee523a2206206994597c13d831ec7"
    const fromTokenAmount = "100000000000000"
    const value = fromTokenAmount
    const swapTarget = "0x3b3ae790Df4F312e745D270119c6052904FB6790"
    const approveTarget = "0x3b3ae790Df4F312e745D270119c6052904FB6790"
    const targetCallData = "0x0d5f0e3b000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb9226600000000000000000000000000000000000000000000000000005af3107a400000000000000000000000000000000000000000000000000000000000000299f50000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000011b815efb8f581194ae79006d24e0d814b7697f6"
    return { fromToken, toToken, fromTokenAmount, swapTarget, approveTarget, targetCallData, value }
}
const buildUSDTToDAI = () => {
    const fromToken = "0xdac17f958d2ee523a2206206994597c13d831ec7"
    const toToken = "0x6b175474e89094c44da98b954eedeac495271d0f"
    const fromTokenAmount = "100000"
    const value = "0x0"
    const swapTarget = "0x3b3ae790Df4F312e745D270119c6052904FB6790"
    const approveTarget = "0x40aA958dd87FC8305b97f2BA922CDdCa374bcD7f"
    const targetCallData = "0x0d5f0e3b000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb9226600000000000000000000000000000000000000000000000000000000000186a0000000000000000000000000000000000000000000000000013fbaa07b2ede310000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000180000000000000000000000048da0965ab2d2cbf1c17c09cfb5cbe67ad5b1406"
    return { fromToken, toToken, fromTokenAmount, swapTarget, approveTarget, targetCallData, value }
}

const getTxResult = async (hash) => {
    const txResult = await provider.getTransaction(hash)
    const receipt = await provider.getTransactionReceipt(hash)
    console.log("txResult: ", txResult)
    console.log("receipt: ", receipt)
}

const main = async () => {
    await getBalance()
    await balanceUSDT()
    await balanceDAI()
    hash = await misesSwapRouter();
    await balanceUSDT()
    await balanceDAI()
    //await getTxResult(hash)
}

main()