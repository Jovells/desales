
import React, { useEffect, useState } from "react";
import { Typography, Button, InputBase } from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';
import AuctionListing from "../components/auctionListing";
import SearchIcon from '@mui/icons-material/Search';
import Link from "next/link";
import { GraphURL } from "../utils";
import { MetaHeader } from "./../components/MetaHeader"
import { useContracts } from "../hooks/contracts";
import LoadingComponent from "../components/LoadingComponent";


const Home = () => {

  const [auctions, setAuctions] = useState([]);
  const {Auction} = useContracts()
  const [loadingAuctions, setLoadingAuctions] = useState(false);
  useEffect(()=>{

    async function getAuctionEvents() {

      try {
        setLoadingAuctions(true)
        const aucs = await Auction.getRecentAuctions(10)
        setAuctions(
          aucs.map(auc=>{
            return {
              auctionId: Number(auc.tokenId),
              seller: auc.seller,
              stablecoin: auc.stablecoin,
              tokenId: Number(auc.tokenId),
              tokenContract: auc.tokenContract,
              endTime: Number(auc.endTime),
              startTime: Number(auc.startTime),
              startPrice: Number(auc.startPrice),
              timestamp: Number(auc.timestamp),
              transactionHash: Auction.target
            }
          }).filter(auc=>auc.auctionId!==0)
        )
      } catch (err) {
        console.error(err)

      }

      setLoadingAuctions(false)
    }

      getAuctionEvents()


  },[window?.ethereum?.chainId])
  return (
    <>
      <MetaHeader />

      {/* <BackgroundImage
        src="https://i.vecteezy.com/vectors/abstract-backdrop-with-monochrome-wave-gradient-lines-on-white-background-modern-technology-background-wave-design-vector-illustration-23426480.jpg"
        alt="Abstract background image"
      /> */}
      
        <Grid container spacing={3} alignItems="center">
          <Grid xs={12} sm={6}>
            <Typography fontFamily={'Titillium Web'} variant="h1" sx={{ fontSize: 50, mt: 10, fontWeight: 700 }}>
              Auction Sales Powered by Blockchain Technology
            </Typography>
            <Typography variant="body1" sx={{ fontSize: 20, mt: 2, fontWeight: 400 }}>
              At Desales, we have harnessed the power of cutting-edge blockchain technology to revolutionize the way auctions are conducted.
            </Typography>
            <Button variant="contained" LinkComponent={Link} href="createAuction" color="primary" size="large" sx={{ mt:2, backgroundColor: 'black' }}>
              Start An auction
            </Button>
          </Grid>
        </Grid>
        <Grid>
          <Typography mt={5} mb={2} variant="h5" fontWeight={500} >
            Latest Auctions
          </Typography>
    
    {loadingAuctions?<LoadingComponent height="100%" alignHorizontal="left"/>:auctions?auctions.map((auction, index) => 
          <AuctionListing first={index === 0} key={auction.auctionId} auction={auction}  />
    ):<Typography >
    No Auctions Available
  </Typography>
  
  }
        </Grid>
    </>
  );
};

export default Home;

