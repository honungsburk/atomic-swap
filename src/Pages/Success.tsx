import { Heading, Spacer, Text, VStack } from "@chakra-ui/react";
import { Browser } from "../components/ChakraKawaii";

function Success() {
  return (
    <>
      <Spacer />
      <VStack>
        <Heading as="h1" size="4xl">
          Success!
        </Heading>
        <Browser mood="lovestruck" color="#00D19F"></Browser>
        <Text textAlign={"center"} fontSize={"xl"} maxWidth={600}>
          The trade was submitted and is waiting to be added to the blockchain.
          Please, refrain from making any more trades before this one has
          completed.
        </Text>
      </VStack>
    </>
  );
}

export default Success;
