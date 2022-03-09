import { Heading, Spacer, Text, VStack, Button } from "@chakra-ui/react";
import { Browser } from "../../components/ChakraKawaii";
import Store from "../../Storage/Store";

function PendingTrade(props: { store?: Store }) {
  return (
    <>
      <Spacer />
      <VStack>
        <Browser mood="shocked" color="#00D19F"></Browser>
        <Heading as="h1" size="xl">
          It seems like you have a pending trade...
        </Heading>
        <Text textAlign={"center"} fontSize={"xl"} maxWidth={600}>
          You can not make any more trades until the current one has been
          cleared.
        </Text>
        {props.store ? (
          <Button
            colorScheme="purple"
            onClick={() => props.store?.deletePendingTx()}
          >
            Trade Anyway
          </Button>
        ) : (
          <></>
        )}
      </VStack>
    </>
  );
}

export default PendingTrade;
