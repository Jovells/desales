import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  ListItemButton,
  Stack,
  Box,
} from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';
import Link from "next/link";
import { Time, convertIpfsUrl, stablecoins } from "../utils";
import Address from "./address";
import {useContracts} from "../hooks/contracts";

function getInitials(str) {
    const nameWords = str.split(' ');
    const nameInitials = nameWords.length === 1 ? nameWords[0].slice(0, 2) 
    : nameWords[0].charAt(0) 
    + nameWords[nameWords.length - 1].charAt(0);
    return nameInitials.toUpperCase();
  }



const AuctionListing = ({ first = true, auction = {name: 'Honda Civic', seller: 'Ghana Ports', timeLeft: '2 days, 5 hours, 52 Seconds', highestBid: '5000 usdt', imageUrl:'' } }) => {
  const [newAuction, setNewAuction] = useState(auction)
  const{DesalesNFT, Auction} = useContracts()
  
  
  useEffect(()=>{
    //get image and metadata from tokenUri
    async function getMetadata() {
      const tokenUriFromContract = await DesalesNFT.tokenURI(auction.tokenId)
      const res = await fetch(convertIpfsUrl(tokenUriFromContract));
      const data = await res.json();
      const imageUrl = convertIpfsUrl(data.image);
      setNewAuction({...data, ...newAuction, imageUrl});
      console.log(data, newAuction, imageUrl)
      return data
    }

    if (auction?.auctionId) getMetadata();

  },[auction?.auctionId])

  const timeLeft = Time.getTimeDifferenceString(auction.endTime);
  
  let highestBid = (parseFloat(newAuction.highestBid || newAuction.startPrice) * 10 ** -6).toFixed(2)
  + ' ' 
  + stablecoins.find((coin) => coin.address.toUpperCase() === newAuction.stablecoin.toUpperCase())?.name
  
  console.log('newAuction', newAuction);
  return (
   <>
   {first && <Grid py={2} px={4} bgcolor={'white'} borderRadius={2} border={'1px solid grey'} container alignItems={'center'}   width={1} >

    
    <Typography width={0.3}>Auction Id</Typography>
        
  
    <Typography width={0.25}>Auctioneer</Typography>

    <Typography width={0.25}>Time Left</Typography>
    <Box marginLeft="auto">

    <Typography >Highest Bid</Typography>
    </Box>
    </Grid> }

    <Link style={{ textDecoration: 'none', color: 'inherit' }} href={`/auctionDetails/${newAuction.auctionId}`}>
    <Grid py={2} px={4} t   borderRadius={2}  component={ListItemButton} container alignItems={'center'}   width={1} >

    <Stack width={0.3}   direction={'row'} alignItems={'center'} >
    <ListItemAvatar>
    <Avatar sx={{ bgcolor: newAuction.imageUrl? '': "black"}}>
        {newAuction.imageUrl 
        ? <img height={"100%"}  src={newAuction.imageUrl} alt="auction image" /> 
        : getInitials(newAuction.auctionId.toString())}
    </Avatar></ListItemAvatar>

    <Typography>{newAuction.auctionId}</Typography>
        </Stack>
    <Box width={0.25} >
    <Address address={newAuction.seller}  TypographyProps={{fontWeight: 'bold'}}/>
    </Box>

    <Typography width={0.25}>{timeLeft}</Typography>
    <Box marginLeft="auto">
    <Typography >{highestBid}</Typography>
    </Box>
    </Grid>
    </Link>
   
 
   </>
  );
};

export default AuctionListing;
