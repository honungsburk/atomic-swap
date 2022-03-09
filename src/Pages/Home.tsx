import {
  Center,
  Heading,
  Spacer,
  VStack,
  Text,
  Image,
  Button,
  Link,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as ReachLink } from "react-router-dom";
import mobileHeroLight from "../assets/img/hero/mobile.jpg";
import mobileHeroDark from "../assets/img/hero/mobile-dark.jpg";
import desktopHeroLight from "../assets/img/hero/desktop.jpg";
import desktopHeroDark from "../assets/img/hero/desktop-dark.jpg";
import { ChannelState } from "../Network/Channel";

export default function Home(props: { channelState: ChannelState }) {
  const layout: "mobile" | "desktop" | undefined = useBreakpointValue({
    base: "mobile",
    lg: "desktop",
  });
  const mobileHero = useColorModeValue(mobileHeroLight, mobileHeroDark);

  const desktopHero = useColorModeValue(desktopHeroLight, desktopHeroDark);

  return (
    <>
      <Spacer />
      <Center mt={6} mx={2}>
        <VStack spacing={8}>
          <Image
            width={["sm", "md", "lg", "3xl", "5xl"]}
            src={layout === "mobile" ? mobileHero : desktopHero}
            alt="Illustration of two people trading"
          ></Image>
          <VStack>
            <Heading fontSize={["3xl", null, "4xl"]} textAlign={"center"}>
              P2P trading on Cardano
            </Heading>
            <Text fontSize={["lg", "xl"]} textAlign={"center"}>
              Trade any number of tokens/NFTs for any other number of
              tokens/NFTs in a{" "}
              <Text as="span" fontWeight={"bold"}>
                single
              </Text>{" "}
              transaction.
            </Text>
            <Link as={ReachLink} to="/session" _hover={{}}>
              <Button colorScheme="primary">
                {props.channelState === "Connected" ? "REJOIN" : "TRY IT OUT"}
              </Button>
            </Link>
          </VStack>
        </VStack>
      </Center>
    </>
  );
}
