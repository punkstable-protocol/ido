const { ether } = require('@openzeppelin/test-helpers');
const RICE = artifacts.require("IFAToken")
const IDO = artifacts.require("Ido")

const detailsTotal = ether('2500')
const startBlock = '2824483'			// One block in 3 seconds, 24h hours later ( current block + 28800  )

const migration = async (deployer, network, accounts) => {
	await Promise.all([
		deployIFAToken(deployer, network, accounts),
		deploySale(deployer, network, accounts),
	]);
}

async function deployIFAToken(deployer, network, accounts) {
	await deployer.deploy(RICE)
}

async function deploySale(deployer, network, accounts) {
	await deployer.deploy(IDO, accounts[4], RICE.address, detailsTotal, startBlock)
}

module.exports = migration
