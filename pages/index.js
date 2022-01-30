import { useState, useEffect } from 'react'
import Web3 from 'web3'

import NFT from '../abi/NFT.json'
import Marketplace from '../abi/Marketplace.json'

export default function Home() {
  const [web3, setWeb3] = useState(undefined)
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => {
    loadNFTs()
  }, [])

  const loadNFTs = async () => {
    const web3 = new Web3(Web3.givenProvider)
    setWeb3(web3)
    const networkId = await web3.eth.net.getId()
    
    if (networkId === 80001) {
      const nftContract = new web3.eth.Contract(NFT.abi, NFT.networks[networkId].address)
      const marketplaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address)
      const data = await marketplaceContract.methods.fetchMarketItems().call()
  
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
  
      setNfts(items)
      setLoadingState('loaded')
    } else {
      alert('Make sure you are on the Polygon Mumbai testnet.')
    }

  }

  const buyNFT = async nft => {
    const accounts = await web3.eth.getAccounts()
    const signer = accounts[0]
    const networkId = await web3.eth.net.getId()
    const marketplaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address)
    await marketplaceContract.methods.createMarketSale(NFT.networks[networkId].address, nft.tokenId)
      .send({ value: web3.utils.toWei(nft.price), from: signer })
    loadNFTs()
  }


  return (
    <div className='flex justify-center'>
      <div className='px-4' style={{ maxWidth: '1600px' }}>
        <div className='grid grid-cols-1 sn:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
          {
            loadingState === 'loaded' && !nfts.length ?
              <h1 className='px-20 py-10 text-3xl'>No items found.</h1>
              : nfts?.map((nft, i) => (
                <div key={i} className='border shadow rounded-xl overflow-hidden'>
                  <img src={nft.image} alt='nft' />
                  <div className='p-4'>
                    <p className='text-2xl font-semibold'>{nft.name}</p>
                    <div style={{ overflow: 'hidden' }}>
                      <p className='text-gray-400'>{nft.description}</p>
                    </div>
                  </div>
                  <div className='p-4 bg-black'>
                    <p className='text-2xl ab-4 font-bold text-white'>{nft.price} MATIC</p>
                    <button className='w-full bg-pink-500 text-white font-bold py-2 px-12 rounded' onClick={() => buyNFT(nft)}>Buy</button>
                  </div>
                </div>
              ))
          }
        </div>
      </div>
    </div>
  )
}
