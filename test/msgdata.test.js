const Ido = artifacts.require("Ido")
const { ether, BN, balance, send, expectRevert, time } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');

const detailsTotal = ether('25')
const startBlock = '0'
const rice = '0xde3966c63B259c01fC07C5e09EE9654d34f9920f'

contract('Ido contract testing', ([alice, bob, carol, breeze, wallet, joy]) => {
    before(async () => {
        this.ido = await Ido.new(wallet, rice, detailsTotal, startBlock, { from: alice })
    })

    it('send data', async () => {
        let walletBalance = await balance.current(wallet)
        let aliceBalance = await balance.current(alice)
        console.log(`walletBalance: ${walletBalance}`)
        console.log(`aliceBalance: ${aliceBalance}`)
        await this.ido.setMerkleRoot("0xd480b20314a0c7ce097af9603bdfbf008a66ed8030ff1903f75b6043d25c8bae")
        await this.ido.contribute(5, "0xf8353AA472B3d64c1269e399E658e05A4FD15BBC",
            "3000000000000000000",
            ["0xfa493279045bce5937d64fe5af189c54b182552b4c150ca82926cc96f128647d", "0x93227e8d0e7325bd58637bd7352ca2c547c7c4e15e675bb4809dd0f67756d2b6"],
            { from: alice, to: this.ido.address, value: ether('1') })
        walletBalance = await balance.current(wallet)
        aliceBalance = await balance.current(alice)
        console.log(`walletBalance: ${walletBalance}`)
        console.log(`aliceBalance: ${aliceBalance}`)
    });

})