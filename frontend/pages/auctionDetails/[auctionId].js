import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import { Button, Chip, Divider, Stack, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAccount, useWalletClient } from "wagmi";
import Address from "../../components/address";
import EventListing from "../../components/eventListing";
import { useContracts } from "../../hooks/contracts";
import { Time, convertIpfsUrl, getTxnEventData, stablecoins } from "../../utils";
import { GraphURL } from "../../utils/";
import { createPublicClient, http } from 'viem'
import { telosTestnet } from 'viem/chains'
import { getContract } from 'viem'
import { abi } from './../../hooks/abi'
import { createWalletClient, custom } from 'viem'





import LoadingComponent from "../../components/LoadingComponent";


function convertBigIntsToNumbers(obj) {
  if (typeof obj === 'bigint') {
    return Number(obj);
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, convertBigIntsToNumbers(value)])
    );
  } else {
    return obj;
  }
}

function AuctionDetails() {
  const [events, setEvents] = useState(null);
  const router = useRouter()
  const { Auction, DesalesNFT, MockStableCoin } = useContracts()
  const account = useAccount()
  const { openConnectModal, connectModalOpen } = useConnectModal();


  const [auction, setAuction] = useState({});

  const [bid, setBid] = useState(0);

  useEffect(() => {
    async function getAuctionData() {
      // convertToStruct takes an array type eg. Inventory.ItemStructOutput and converts it to an object type.


      // This is to remove unnecessary properties from the output type. Use it eg. `ExtractPropsFromArray<Inventory.ItemStructOutput>`
      const auctionDetailsFromContract = await Auction.getAuction(router.query.auctionId)
      const d = auctionDetailsFromContract;
      const tokenUriFromContract = await DesalesNFT.tokenURI(auctionDetailsFromContract?.tokenId)
      const obj = {}
      obj.seller = auctionDetailsFromContract.seller
      obj.stablecoin = auctionDetailsFromContract.stablecoin
      obj.startTime = auctionDetailsFromContract.startTime
      obj.endTime = auctionDetailsFromContract.endTime
      obj.startPrice = auctionDetailsFromContract.startPrice
      obj.highestBidder = auctionDetailsFromContract.highestBidder
      obj.highestBid = auctionDetailsFromContract.highestBid
      obj.tokenId = auctionDetailsFromContract.tokenId
      obj.tokenContract = auctionDetailsFromContract.tokenContract
      obj.withdrawn = auctionDetailsFromContract.withdrawn
      obj.claimed = auctionDetailsFromContract.claimed
      obj.preventSniping = auctionDetailsFromContract.preventSniping
      
      let auc = convertBigIntsToNumbers(obj);
      const metadata = await (await fetch(convertIpfsUrl(tokenUriFromContract))).json();
      console.log('m', metadata, 'a', auc);
      const imageUrl = convertIpfsUrl(metadata.image);
      auc = { ...metadata, ...auc, imageUrl }
      console.log(auc)
      setAuction(auc);
      setBid(((auc.startPrice) * 10 ** -6 + 0.01).toFixed(2))
    }
    try {
      getAuctionData()
    } catch (error) {
      console.log(error)
    }


  }, [router.query.auctionId]);

  //read withdrawal and Bid EVents from The Graph


  async function handleBid() {
    const walletClient = createWalletClient({
      chain: telosTestnet,
      transport: custom(window.ethereum)
    })
    
     const publicClient = createPublicClient({
      chain: telosTestnet,
      transport: http(),
    })
    
    // 1. Create contract instance
     const viemAuction = getContract({
      address: '0x0aDa7CfA69Add88C2BF2B2e15979A4d509Deaa1A',
      abi: abi,
      walletClient,
      publicClient
    })
    

    if (!account.isConnected) {
      return openConnectModal();
    }
    const parsedBid = parseInt(bid * 10 ** 6)
    if (parsedBid <= auction.highestBid) {

      return toast.error('Bid must be higher than highest bid');
    }
    const allowance = await MockStableCoin.allowance(account.address, Auction.target)
    if (allowance < BigInt(parsedBid)) {
      const toastId = toast.loading("Seeking Approval For token Transfer");
      const approval = await MockStableCoin.approve(Auction.target, BigInt(parsedBid) - allowance)
      const txnReceipt = await approval.wait()
      toast.success("Approval Successful", { id: toastId });
    }
    // const toastId = toast.loading("Placing Bid");
    //   (await Auction.placeBid(router.query.auctionId, parsedBid, {gasLimit: 30000})).wait().then((txnReceipt) => {
    //     toast.success("Bid Placed Successfully", { id: toastId });
    //   })

      const hash = await viemAuction.write.placeBid([router.query.auctionId, parsedBid],{
        account: account.address,
      })

    

    toast.dismiss();

  }
  async function handleWithdraw() {
    console.log('withdraw');
    (await Auction.withdraw(router.query.auctionId)).wait().then((txnReceipt) => {
      toast.success("Withdrawn Successfully");
    })
  }
  async function handleClaim() {

    console.log('claim');
    (await Auction.claim(router.query.auctionId)).wait().then((txnReceipt) => {
      toast.success("Claimed Successfully");
    })
  }

  async function handlemint(){
    console.log('mint');
    const toastId = toast.loading("Minting");
    (await MockStableCoin.mint()).wait().then((txnReceipt) => {
      toast.success("Minted Successfully", { id: toastId });
      toast.dismiss(toastId)
    })
  }


  const isHighestBidder = auction.highestBidder === (account?.address);
  const isSeller = auction.seller === (account?.address);
  const auctionEnded = auction.endTime < Date.now() / 1000;
  const claimed = auctionEnded && auction.claimed && isHighestBidder;
  const withDrawable = auctionEnded && !auction.withdrawn && isSeller;
  const claimable = !claimed && isHighestBidder && auctionEnded && isHighestBidder;
  console.log({
    bidEnded: auctionEnded, claimable, claimed, withDrawable, hb: auction.highestBidder, c: (auction.highestBidder === (account?.address)), cd: (events?.claimeds[0]?.bidder),
    ac: (auction?.claimed),
    withDrawable
  });
  const auctionStarted = auction.startTime <= Date.now() / 1000;
  const auctionStartedBidded = auctionStarted && auction.highestBid
  const timeDifference = Time.getTimeDifference(auctionStarted ? auction.endTime : auction.startTime)
  return (
    auction?.name ?
      <Grid mx={'auto'} columnGap={6} rowGap={3} pt={5} container >

        <Grid
          md={6}
          width={1}
          height={'600px'}
          borderRadius={'10px'}
          border={'1px solid grey'}
          sx={{
            backgroundImage: `url("${auction.imageUrl}")` || '',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          cursor={'pointer'}

        >

          {!auction.imageUrl && (
            <InsertPhotoIcon sx={{ fontSize: 30, color: 'grey.500' }} />
          )}
        </Grid>
        <Grid maxHeight={'600px'} columnGap={2} pr={1}
          sx={{
            '&::-webkit-scrollbar': {
              width: '0.4em',

            },
            '&::-webkit-scrollbar-track': {
              boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
              webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,.1)',
              borderRadius: '8px',
              // outline: '1px solid slategrey'
            }
          }}
          overflow={'auto'} md={5}   >
                                      <Button onClick={handlemint}>Click to Mint MockStablecoin</Button>


          <Grid maxWidth={400} mb={1}>
            <Typography overflow={'hidden'} textOverflow={'ellipsis'} variant="h4" fontWeight={'bold'} >{auction.name}</Typography>
            <Typography variant="caption" color={'text.disabled'} > Created on {Time.formatDate(auction.timestamp || auction.startTime)}</Typography>
          </Grid>

          <Grid direction={'column'} maxWidth={1} container bgcolor={'#f2f2f2'} p={3} borderRadius={3}>

            <Stack justifyContent={'space-between'} direction={'row'}>
              <Grid>
                {auctionEnded ?
                  <Chip sx={{ mb: 1, }} color="info" label="auctionEnded" />
                  :
                  <Typography variant="caption"  >Auction {auctionStarted ? 'ends' : 'starts'} in:</Typography>
                }
                {!auctionEnded ? <Stack direction='row'>
                  <Stack whiteSpace="pre">
                    <Typography variant="h5" fontWeight={'bold'} >{timeDifference.days} : </Typography>
                    <Typography variant="caption" color={'text.disabled'} >Days</Typography>
                  </Stack>
                  <Stack whiteSpace="pre">
                    <Typography variant="h5" fontWeight={'bold'} >{timeDifference.hours} : </Typography>
                    <Typography variant="caption" color={'text.disabled'} >Hours</Typography>
                  </Stack>
                  <Stack whiteSpace="pre">
                    <Typography variant="h5" fontWeight={'bold'} >{timeDifference.minutes}</Typography>
                    <Typography variant="caption" color={'text.disabled'} >Minutes</Typography>
                  </Stack>
                </Stack> :
                  <><Typography fontWeight={'bold'} display={"block"} ml={1.5} pb={0.5} variant="caption"  >
                    Winner:</Typography>

                    <Address address={auction.highestBidder} />

                  </>


                }
              </Grid>
              <Divider sx={{ mx: 1, height: 'initial' }} orientation="vertical"></Divider>

              <Grid >
                <Typography display={'block'} variant="caption" > {auctionStartedBidded || auctionEnded ? 'Highest Bid' : 'Starting Price:'}</Typography>
                <Stack direction={'row'} flexWrap={'nowrap'}>
                  <Typography variant="h4" display={'inline'} fontWeight={'bold'} >{(auction[auctionStartedBidded || auctionEnded ? 'highestBid' : 'startPrice'] * 10 ** -6).toFixed(2)}</Typography>
                  <Typography pl={1} variant="h4" display={'inline'} color={'text.secondary'} > {stablecoins.find(coin => coin.address.toUpperCase() === auction.stablecoin?.toUpperCase())?.name}</Typography>
                </Stack>
              </Grid>
            </Stack>
            {auctionStarted && <>

              <Grid container direction={'column'} >
                {claimable && <>
                  <Typography sx={{ bgcolor: 'black', p: 2, borderRadius: 2, fontWeight: 'bold', color: 'lightGreen' }} display={"flex"} mt={2} mb={1} variant="caption" width={160}  >
                    Congratulations! You won the Auction!
                  </Typography>
                  {!claimed ? <><Typography display={"block"} mt={2} mb={1} variant="caption" width={180}  >
                    You can claim your item now:</Typography>

                    <Button onClick={handleClaim} sx={{ mb: 2 }} variant="contained">Claim</Button>
                  </> : <Typography display={"block"} mt={2} mb={1} variant="caption" width={180}  >
                    You have claimed this item.
                  </Typography>

                  }</>
                }
                {isSeller && auctionEnded && (!auction.withdrawn ? <>
                  <Typography display={"block"} mt={2} mb={1} variant="caption" width={160}  >
                    Bidding has ended. You can Withdraw now:
                  </Typography>

                  <Button onClick={handleWithdraw} variant="contained">Withdraw</Button>
                </>
                  : <Typography display={"block"} mt={2} mb={1} variant="caption" width={160}  >
                    You have withdrawn.
                  </Typography>)


                }

                {(!auctionEnded && auctionStarted) && <Stack >
                  <TextField type="number" value={bid} onChange={(e) => setBid(e.target.value)} label='Bid Amount' sx={{ mt: 3, mb: 2 }} placeholder="Enter Bid Amount" />
                  <Button onClick={handleBid} variant="contained">{account.isConnected ? 'Place Bid' : 'Connect Wallet'}</Button>
                </Stack>}

              </Grid></>}

          </Grid>
          <Grid container sm={5} md={10} rowGap={1} pt={2}>
            <Stack width={1} alignItems={"baseline"} direction={'row'} justifyContent={"space-between"} columnGap={2}>
              <Typography variant="caption" color={'text.disabled'} > Created By</Typography>
              <Address address={auction.seller} />
            </Stack>

            <Stack width={1} alignItems={"baseline"} direction={'row'} justifyContent={"space-between"} columnGap={2}>
              <Typography variant="caption" color={'text.disabled'} > Start Time</Typography>
              <Typography  >{Time.formatDate(auction.startTime)}</Typography>
            </Stack>
            <Stack width={1} alignItems={"baseline"} direction={'row'} justifyContent={"space-between"} columnGap={2}>
              <Typography variant="caption" color={'text.disabled'} > End Time</Typography>
              <Typography  >{Time.formatDate(auction.endTime)}</Typography>
            </Stack>
            <Stack width={1} alignItems={"baseline"} direction={'row'} justifyContent={"space-between"} columnGap={2}>
              <Typography variant="caption" color={'text.disabled'} > External Link</Typography>
              <Typography
                variant="subtitle1"
                component="a"
                href={"auction.externalLink"}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textDecoration: 'none', color: 'primary.main' }}
              >
                {`${auction.externalLink?.slice(0, 30)}...`}
              </Typography>
            </Stack>
            <Stack width={1} alignItems={"baseline"} direction={'row'} justifyContent={"space-between"} columnGap={2}>
              <Typography variant="caption" color={'text.disabled'} > Description</Typography>
              <Typography textAlign={'right'} textOverflow={'ellipsis'} pl={3} >{auction.description}</Typography>
            </Stack>
          </Grid>

        </Grid>

        <Grid width={1} md={11}>
          {/* <a href='https://mumbai.polygonscan.com/address/0x22e5768fD06A7FB86fbB928Ca14e9D395f7C5363#writeContract'> Go to token Address </a> */}
          <Typography width={1} variant="h6" mt={6} mb={2} fontWeight={'bold'} >Bid History</Typography>

        </Grid>

      </Grid>
      : <LoadingComponent />

  );
};

export default AuctionDetails;