import Image from "next/image";
import Link from "next/link";
import logo from "./../public/logo.svg";
import { AppBar, Box, Button, Divider, Paper, Stack, Toolbar, Typography } from "@mui/material";
import { ConnectButton } from "@rainbow-me/rainbowkit";

/**
 * Site header
 */
export const Header = () => {
  return (
    <>
      <Stack py={2} mx={"auto"} maxWidth={"lg"} direction={"row"} justifyContent="space-between">
        <Link style={{ textDecoration: "none", color: "inherit" }} href="/">
          <Stack direction={"row"} alignContent={"center"} gap={1} alignItems={"center"}>
            <Image priority width={50} height={50} src={logo} alt="Follow us on Twitter" />
            <Typography fontFamily={'Titillium Web'} fontWeight={'bold'} variant="h6">Dauctions</Typography>
          </Stack>
        </Link>
        <ConnectButton />
      </Stack>
      <Divider />
    </>
  );
};
