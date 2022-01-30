import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Web3 from 'web3'

import NFT from '../abi/NFT.json'
import Marketplace from '../abi/Marketplace.json'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

export default function CreateItem() {
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, setFormInput] = useState({ price: '', name: '', description: '' })
    const router = useRouter()

    const onChange = async e => {
        const file = e.target.files[0]
        try {
            const added = await client.add(file)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileUrl(url)
        } catch (e) {
            console.log(e)
        }
    }

    const createItem = async () => {
        const { name, description, price } = formInput
        if (!name || !description || !price || !fileUrl) return
        const data = JSON.stringify({ name, description, image: fileUrl })

        try {
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            createSale(url)
        } catch (e) {
            console.log(e)
        }
    }

    const createSale = async url => {
        const web3 = new Web3(Web3.givenProvider);
        const networkId = await web3.eth.net.getId()

        if (networkId === 80001) {
            const accounts = await web3.eth.getAccounts()
            const signer = accounts[0]

            const nftContract = new web3.eth.Contract(NFT.abi, NFT.networks[networkId].address)
            let transaction = await nftContract.methods.createToken(url).send({ from: signer })
            const tokenId = transaction.events.Transfer.returnValues.tokenId
            const price = web3.utils.toWei(formInput.price.toString(), 'ether')

            const marketplaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address)
            const listingFee = await marketplaceContract.methods.listingFee().call()
            transaction = await marketplaceContract.methods.createMarketItem(NFT.networks[networkId].address, tokenId, price).send({ value: listingFee, from: signer })

            router.push('/')
        } else {
            alert('Make sure you are on the Polygon Mumbai testnet.')
        }
    }

    return (
        <div className='flex justify-center'>
            <div className='w-1/2 flex flex-col pb-12'>
                <input
                    placeholder='Asset Name'
                    className='mt-8 border rounded p-4'
                    onChange={e => setFormInput({ ...formInput, name: e.target.value })}
                />
                <textarea
                    placeholder='Asset Description'
                    className='mt-2 border rounded p-4'
                    onChange={e => setFormInput({ ...formInput, description: e.target.value })}
                />
                <input
                    placeholder='Asset Price (MATIC)'
                    className='mt-2 border rounded p-4'
                    onChange={e => setFormInput({ ...formInput, price: e.target.value })}
                />
                <input
                    type='file'
                    placeholder='Asset'
                    className='my-4'
                    onChange={onChange}
                />
                {
                    fileUrl && <img className='rounded mt-4' width='350' src={fileUrl} />
                }
                <button onClick={createItem} className='font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg'>
                    Create NFT
                </button>
            </div>
        </div>
    )
}