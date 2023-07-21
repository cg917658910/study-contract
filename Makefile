fork:
	npx hardhat node --fork https://eth-mainnet.alchemyapi.io/v2/Lc3PcYa6v8RKQSq6YwgAZCeEIn2kPpIr --fork-block-number 17568920
test:
	npx hardhat test
compile:
	npx hardhat compile --show-stack-traces
deploy:
	npx hardhat run --network localhost scripts/deploy/MisesSwapRouter.js
run:
	node scripts/index.js