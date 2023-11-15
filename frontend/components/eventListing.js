import React from "react";
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
import {Time} from "../utils";
import Address from "./address";

const EventListing = ({ first = true, bidEvent = {transactionHash: '0x678c1866b15bbb9066bacef86f26d4baee66ff830114089fff894309c48cd600', bidder: 'Ghana Ports', blockTimestamp: Time.formatDate(1695893123), amount: '5000 usdt'} }) => {
  return (
   <>

   {first && <Grid py={1} px={4} bgcolor={'white'} borderRadius={2} border={'1px solid grey'} container alignItems={'center'}   width={1} >

    
    <Typography variant="caption" width={0.25}>Transaction Id</Typography>
        
  
    <Typography variant="caption" width={0.25}>Bidder</Typography>

    <Typography variant="caption" width={0.25}>Time of Bid</Typography>
    <Box marginLeft="auto">

    <Typography variant="caption" >Amount</Typography>
    </Box>
    </Grid> }

   
    <Grid py={2} mt={1} px={4} sx={{":hover": {bgcolor: 'grey.200'}}} bgcolor={'grey.100'}  borderRadius={2}  component={ListItemButton} container alignItems={'center'}   width={1} >

    <Address otherProps={{width : 0.25}} address={bidEvent.transactionHash}> </Address>

  
    <Address otherProps={{width : 0.25}} address={bidEvent.bidder} > </Address>

    <Typography variant="subtitle2" width={0.25}>{Time.formatDate(bidEvent.blockTimestamp)}</Typography>
    <Box marginLeft="auto">
    <Typography variant="subtitle2" >{bidEvent.amount}</Typography>
    </Box>
    </Grid>
   
 
   </>
  );
};

export default EventListing;
