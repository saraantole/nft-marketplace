import '../styles/globals.css'
import Link from 'next/link'
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>NFT Marketplace</title>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/ico" sizes="16x16" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <div>
        <nav className='border-b p-6'>
          <p className='text-4xl font-bold'>NFT Marketplace</p>
          <div className='flex mt-4'>
            <Link href='/'><a className='mr-6 text-pink-500'>Home</a></Link>
            <Link href='/create-item'><a className='mr-6 text-pink-500'>Sell Digital Asset</a></Link>
            <Link href='/my-assets'><a className='mr-6 text-pink-500'>My Digital Assets</a></Link>
            <Link href='/creator-dashboard'><a className='mr-6 text-pink-500'>Creator Dashboard</a></Link>
          </div>
        </nav>
        <Component {...pageProps} />
      </div>
    </>
  )
}

export default MyApp
