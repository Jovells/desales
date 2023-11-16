import { Stack } from "@mui/material";
import Image from "next/image";
import LoadingIcon from "../public/assets/spinner.svg"


export default function LoadingComponent({height= '80vh', alignHorizontal ='center', alignVertical='center' }) {
  return (
    <Stack
    height={height}
    direction={"row"} alignItems={alignVertical} justifyContent={alignHorizontal}>
      <Image    priority
    src={LoadingIcon}
    alt="Follow us on Twitter"
  />
    </Stack> 
      
  );
}