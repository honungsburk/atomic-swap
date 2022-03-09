import {
  Center,
  VStack,
  Text,
  Link,
  Image,
  Flex,
  Spacer,
  Heading,
} from "@chakra-ui/react";
import NamiLogoSVG from "../../assets/img/nami-logo.svg";
import ccvaultLogo from "../../assets/img/ccw-logo.png";

export default function HasNoWallet() {
  return (
    <>
      <Spacer></Spacer>
      <Center mt={6} mx={2}>
        <VStack spacing={8}>
          <VStack>
            <Heading fontSize={["2xl"]} textAlign={"center"}>
              Sorry! It seems like you do not have a compatible wallet.
            </Heading>
            <Heading fontSize={["lg"]}>A few options...</Heading>
          </VStack>
          <Wallets></Wallets>
        </VStack>
      </Center>
    </>
  );
}

function Wallets() {
  return (
    <VStack width={["100%", "sm", "md", "lg"]}>
      <CompatibleWallet
        name="Nami Wallet"
        href="https://namiwallet.io/"
        src={NamiLogoSVG}
      />
      <CompatibleWallet
        name="ccvault"
        href="https://ccvault.io/"
        src={ccvaultLogo}
      />
    </VStack>
  );
}

function CompatibleWallet(props: { name: string; href: string; src: string }) {
  return (
    <Link href={props.href} isExternal width={"100%"}>
      <Flex
        px={[4, 6, 8]}
        py={[2, 3, 4]}
        bgColor={"accent.500"}
        _hover={{
          bgColor: "accent.600",
        }}
        cursor={"pointer"}
        width={"full"}
        rounded={8}
      >
        <Center>
          <Text fontSize={[24, 28, 32]} fontWeight={"bold"}>
            {props.name}
          </Text>
        </Center>
        <Spacer></Spacer>
        <Image
          boxSize={[12, 16, 20]}
          objectFit="cover"
          src={props.src}
          alt={props.name}
        />
      </Flex>
    </Link>
  );
}
