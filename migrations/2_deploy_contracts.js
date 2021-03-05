const { ether } = require('@openzeppelin/test-helpers');
const RICE = artifacts.require("IFAToken")
const IDO = artifacts.require("Ido")

const detailsTotal = ether('2500')
const startBlock = '1'			// One block in 3 seconds, 24h hours later ( current block + 28800  )

const wallet = '0xeC849EBBD791d3219d73B6c72721D1245F8cb95B'

const migration = async (deployer, network, accounts) => {
	await Promise.all([
		await deployIFAToken(deployer, network, accounts),
		await deploySale(deployer, network, accounts)
	]);
}

async function deployIFAToken(deployer, network, accounts) {
	await deployer.deploy(RICE)
}

async function deploySale(deployer, network, accounts) {
	await deployer.deploy(IDO, wallet, RICE.address, detailsTotal, startBlock)
}

module.exports = migration
