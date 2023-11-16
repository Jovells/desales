import { Tooltip, Button, Box, Typography, Chip } from "@mui/material";

function stringType(str) {
  const isBlockNumber = /^\d+$/.test(str);
  const isWalletAddress = /^0x[a-fA-F0-9]{40}$/.test(str);
  const isTransactionHash = /^0x[a-fA-F0-9]{64}$/.test(str);

  if (isBlockNumber) {
    return 'block';
  } else if (isWalletAddress) {
    return 'address';
  } else if (isTransactionHash) {
    return 'tx';
  } else {
    return 'unknown';
  }
}


export default function Address({address, chipProps,  otherProps={}, chars, TypographyProps}) {
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Box sx={{...otherProps}}>
      <Tooltip  title={address}>
    <Chip size='small' {...chipProps} label={        <Typography
          variant="subtitle2"
          {...TypographyProps}
          component="a"
          href={`https://testnet.teloscan.io/${stringType(address)}/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ textDecoration: 'none', color: 'inherit' }}
        >
          {`${address?.slice(0, chars || 6)}...${address?.slice( chars ||  -6)}`}
        </Typography>} >

      <Button onClick={() => copyToClipboard(address)} >Copy</Button>
    </Chip>
      </Tooltip>
    </Box>
  );
}