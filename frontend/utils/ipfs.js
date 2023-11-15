import { NFTStorage } from 'nft.storage'

// read the API key from an environment variable. You'll need to set this before running the example!
const API_KEY = process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY

// For example's sake, we'll fetch an image from an HTTP URL.
// In most cases, you'll want to use files provided by a user instead.


export  default async function storeNFT(image, data) {
  const nft = {
    image, // use image Blob as `image` field
...data, // include all other metadata in the token
    }
  

  const client = new NFTStorage({ token: API_KEY })
  const metadata = await client.store(nft)

  console.log('NFT data stored!')
  console.log('Metadata URI: ', metadata.url)
  return metadata
}

