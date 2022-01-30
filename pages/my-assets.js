import { useEffect, useState } from 'react'
import Web3 from 'web3'

import NFT from '../abi/NFT.json'
import Marketplace from '../abi/Marketplace.json'

export default function MyAssets() {
    const [myNfts, setMyNfts] = useState([])
    const [loading, setLoading] = useState('not-loaded')

    useEffect(() => {
        loadNFTs()
    }, [])

    const loadNFTs = async () => {
        const web3 = new Web3(Web3.givenProvider)
        const networkId = await web3.eth.net.getId()

        if (networkId === 80001) {
            const accounts = await web3.eth.getAccounts()
            const signer = accounts[0]
            const nftContract = new web3.eth.Contract(NFT.abi, NFT.networks[networkId].address)
            const marketplaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address)
            const data = await marketplaceContract.methods.fetchMyNFTs().call({ from: signer })

            const items = await Promise.all(data.map(async i => {
                const tokenUri = await nftContract.methods.tokenURI(i.tokenId).call()
                const meta = await fetch(tokenUri)
                const data = await meta.json()

                const item = {
                    price: web3.utils.fromWei(i.price),
                    tokenId: i.tokenId,
                    seller: i.seller,
                    owner: i.owner,
                    image: data.image,
                    name: data.name,
                    description: data.description
                }
                return item
            }))

            setMyNfts(items)
            setLoading('loaded')
        } else {
            alert('Make sure you are on the Polygon Mumbai testnet.')
        }
    }

    if (loading === 'loaded' && !myNfts.length) return <h1 className='py-10 px-20 text-3xl'>No assets found.</h1>

    return (
        <div className='flex justify-content'>
            <div className='p-4'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
                    {myNfts?.map((nft, i) => (
                        <div key={i} className='border shadow rounded-xl overflow-hidden'>
                            <img src={nft.image} alt='nft' className='rounded' />
                            <div className='p-4 bg-black'>
                                <p className='text-2xl font-bold text-white'>Price - {nft.price} MATIC</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}