import { Center, Text, Spinner, VStack } from "@chakra-ui/react";

export default function Loading(): JSX.Element {
  return (
    <Center height={"100vh"}>
      <VStack>
        <Spinner color="primary.500" size="xl" />
        <Text fontSize={12}>LOADING...</Text>
      </VStack>
    </Center>
  );
}
