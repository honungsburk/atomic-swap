import { Center, Heading, Spacer, VStack } from "@chakra-ui/react";
import { Browser } from "../components/ChakraKawaii";

export default function NotFound() {
  return (
    <>
      <Spacer></Spacer>
      <Center>
        <VStack>
          <Browser size={200} mood="sad" color="#E0E4E8"></Browser>
          <Heading size={"xl"}>404 - Page Not Found</Heading>
        </VStack>
      </Center>
    </>
  );
}
