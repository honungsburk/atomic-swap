import { Heading, Spacer, VStack } from "@chakra-ui/react";
import CopyCard from "../../components/CopyCard";
import QRCode from "../../components/QRCode";

export default function SendLink(props: { link: string }) {
  return (
    <>
      <Spacer />
      <VStack spacing={3} px={1}>
        <Heading textAlign={"center"} fontSize={["2xl", "3xl", "4xl"]}>
          Send the link to someone you want to trade with!
        </Heading>
        <QRCode value={props.link} width={300} height={300}></QRCode>
        <CopyCard value={props.link} isLink={true}></CopyCard>
      </VStack>
    </>
  );
}
