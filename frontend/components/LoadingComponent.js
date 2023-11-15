import { Stack } from "@mui/material";
import Image from "next/image";
import LoadingIcon from "../public/assets/spinner.svg"


export default function LoadingComponent() {
  return (
    <Stack
    height={'80vh'}
    direction={"row"} alignItems={'center'} justifyContent={'center'}>
      <Image    priority
    src={LoadingIcon}
    alt="Follow us on Twitter"
  />
    </Stack> 
      
  );
}