import { Center, VStack, Text, useColorModeValue } from "@chakra-ui/react";
import { Planet } from "../../components/ChakraKawaii";
import colors from "../../Theme/colors";

export default function WaitingForSignaturePrompt() {
  const colorMode = useColorModeValue(
    { color: "black", bgColor: "accent.500" },
    {
      color: "white",
      bgColor: "accentDarkMode.700",
    }
  );
  return (
    <Center
      bgColor={colorMode.bgColor}
      rounded={16}
      width={240}
      height={240}
      p={2}
    >
      <VStack>
        <Text
          textAlign="center"
          maxWidth={140}
          fontSize={24}
          fontWeight="medium"
          color={colorMode.color}
        >
          Waiting for signature...
        </Text>
        <Planet
          size={120}
          mood="excited"
          color={colors.characters.planet}
        ></Planet>
      </VStack>
    </Center>
  );
}
