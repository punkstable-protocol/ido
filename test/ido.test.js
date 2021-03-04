const RICE = artifacts.require("IFAToken")
const Ido = artifacts.require("Ido")
const { ether, BN, balance, send, expectRevert, time } = require('@openzeppelin/test-helpers');

const detailsTotal = ether('2500')
const startBlock = '1000'

contract('Ido contract testing', ([alice, bob, carol, breeze, wallet, weifong]) => {
    before(async () => {
        // this.rice = await RICE.deployed()
        // this.ido = await Ido.deployed()
        this.rice = await RICE.new({ from: alice })
        this.ido = await Ido.new(wallet, this.rice.address, detailsTotal, startBlock, { from: alice })
        let latestBlock = await time.latestBlock()
        await this.rice.addMinter(alice, { from: alice })
        await this.rice.mint(alice, ether('20000000'), { from: alice })
        await this.rice.transfer(this.ido.address, ether('20000'), { from: alice })
        if (await this.rice.balanceOf(bob) < ether('10')) {
            await this.rice.transfer(bob, ether('10'), { from: alice })
            await this.rice.transfer(carol, ether('20'), { from: alice })
            await this.rice.transfer(breeze, ether('200'), { from: alice })
            await this.rice.transfer(weifong, ether('100'), { from: alice })
            // console.log(`give account transfer xx ether`)
        }
        this.exchangeRate = await this.ido.exchangeRate()
    });

    it('transfer ht to Ido', async () => {
        // update rate
        let currentRate = await this.ido.exchangeRate()
        await this.ido.updateRate(currentRate)
        let rate = await this.ido.exchangeRate()
        assert.strictEqual(
            rate.toString(),
            currentRate.toString()
        )

        // change owner
        await this.ido.changeCreator(bob, { from: alice })
        await expectRevert(
            this.ido.updateRate(10, { from: alice }),
            'Ownable: caller is not the owner'
        )
        await this.ido.changeCreator(alice, { from: bob })

        // transfers Ido
        let walletETH = await balance.current(wallet)
        await send.ether(bob, this.ido.address, ether('1'))

        // Multiple transfers
        await expectRevert(
            send.ether(bob, this.ido.address, ether('2')),
            'Number of times exceeded'
        )

        // Over-limit transfer
        await expectRevert(
            send.ether(breeze, this.ido.address, ether('0')),
            'The subscription quantity exceeds the limit'
        )
        await expectRevert(
            send.ether(breeze, this.ido.address, ether('101')),
            'The subscription quantity exceeds the limit'
        )

        // carol and weifong transfer 10 ether to Ido
        await send.ether(carol, this.ido.address, ether('10'))
        await send.ether(weifong, this.ido.address, ether('1'))

        // wallet ETH balace equal
        assert.strictEqual(
            (await balance.current(wallet)).toString(),
            walletETH.add(ether('12')).toString(),
            'wallet ETH balace error'
        )
    });

    it('getHeldCoin', async () => {
        let getHeldCoin = await this.ido.getHeldCoin(bob)
        assert.strictEqual(
            getHeldCoin.toString(),
            ether('1').mul(new BN(this.exchangeRate)).toString(),
            'getHeldCoin amount error'
        )
    });

    it('releaseHeldCoins', async () => {
        let bobRice = await this.rice.balanceOf(bob)
        let carolRice = await this.rice.balanceOf(carol)
        let bobHeldToken = bobRice.add(ether('1').mul(new BN(this.exchangeRate)))
        let carolHeldToken = carolRice.add(ether('10').mul(new BN(this.exchangeRate)))

        // Not yet to pick up time
        await expectRevert(
            this.ido.releaseHeldCoins({ from: bob }),
            'revert'
        )

        await expectRevert(
            this.ido.closeSale({ from: bob }),
            'Ownable: caller is not the owner'
        )

        await this.ido.closeSale({ from: alice })

        // bob releaseHeldCoins
        await this.ido.releaseHeldCoins({ from: bob })
        assert.strictEqual(
            (await this.rice.balanceOf(bob)).toString(),
            bobHeldToken.toString(),
            'Wrong quantity'
        )

        // carol releaseHeldCoins
        await this.ido.releaseHeldCoins({ from: carol })
        assert.strictEqual(
            (await this.rice.balanceOf(carol)).toString(),
            carolHeldToken.toString(),
            'Wrong quantity'
        )
    });

    it('rice transfer change', async () => {
        // close rice transfer
        await this.ido.changeTransferStats(0, { from: alice })
        await expectRevert(
            this.ido.releaseHeldCoins({ from: weifong }),
            'Transaction stopped'
        )
    });

    it('ido info', async () => {
        let maxAllocation = await this.ido.maxAllocation()
        let poolDetails = await this.ido.maxFundsRaised()
        let totalRaise = await this.ido.totalRaise()
        let heldTotal = await this.ido.heldTotal()
        assert.strictEqual(
            heldTotal.toString(),
            ether('12').mul(this.exchangeRate).toString(),
            'held total amount error'
        )
        assert.strictEqual(
            totalRaise.toString(),
            ether('12').toString(),
            'raise total amount error'
        )
        assert.strictEqual(
            maxAllocation.toString(),
            ether('100').toString(),
            'max allocation amount error'
        )
        assert.strictEqual(
            poolDetails.toString(),
            detailsTotal.toString(),
            'pool details amount error'
        )
    });
});