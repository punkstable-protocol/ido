const { ether } = require('@openzeppelin/test-helpers');
const RICE = artifacts.require("IFAToken")
const IDO = artifacts.require("Ido")

const detailsTotal = ether('250')
const startBlock = '1'			// One block in 3 seconds, 24h hours later ( current block + 28800  ), Mar-05-2020 17:39:23

const wallet = '0xC7C47a05E6c9CAa9B1D1cEebc5e559A3E7713204'
const rice = '0xAe479E294C6De21842A4dbdf6785D1eACb0a23aE'

const migration = async (deployer, network, accounts) => {
	await Promise.all([
		// await deployRICEToken(deployer, network, accounts),
		await deploySale(deployer, network, accounts)
	]);
}

async function deployRICEToken(deployer, network, accounts) {
	await deployer.deploy(RICE)
}

async function deploySale(deployer, network, accounts) {
	await deployer.deploy(IDO, wallet, rice, detailsTotal, startBlock)
}

module.exports = migration
