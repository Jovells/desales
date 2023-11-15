import { Tooltip, Button, Box, Typography, Chip } from "@mui/material";

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
          href={`https://mumbai.polygonscan.com/search?f=0&q=${address}`}
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