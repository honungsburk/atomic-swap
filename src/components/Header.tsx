import { Center, VStack, Text, Heading } from "@chakra-ui/react";
import AtomicSwapLogo from "./Logo";

function Header() {
  return (
    <VStack spacing={0}>
      <Center>
        <AtomicSwapLogo boxSize="128px" />
      </Center>
      <Heading fontSize="3xl">Atomic Swap</Heading>
      <Text textAlign={"center"} fontSize="sl">
        P2P trading without an escrow - only on Cardano
      </Text>
    </VStack>
  );
}

export default Header;
