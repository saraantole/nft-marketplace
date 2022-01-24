const Marketplace = artifacts.require('Marketplace');
const NFT = artifacts.require('NFT');

contract('Marketplace', async ([owner, buyer, seller]) => {
    let market, nft, listingFee, auctionPrice;

    beforeEach(async () => {
        market = await Marketplace.new({ from: owner })
        nft = await NFT.new(market.address)
        const fee = await market.listingFee()
        listingFee = fee.toString()
    })

    describe('Contract', () => {
        it('creates and executes sales', async () => {
            auctionPrice = web3.utils.toWei('10', 'ether')
            await nft.createToken('https://mytokenlocation.com')
            await nft.createToken('https://mytokenlocation2.com')

            await market.createMarketItem(nft.address, 1, auctionPrice, { value: listingFee })
            await market.createMarketItem(nft.address, 2, auctionPrice, { value: listingFee })

            await market.createMarketSale(nft.address, 1, { from: buyer, value: auctionPrice })

            let items = await market.fetchMarketItems()
            items = await Promise.all(items.map(async i => {
                const tokenUri = await nft.tokenURI(i.tokenId)
                const item = {
                    price: i.price.toString(),
                    tokenId: i.tokenId.toString(),
                    seller: i.seller,
                    owner: i.owner,
                    tokenUri
                }

                return item
            }))

            expect(items).to.have.length(1);
        })
    })
})