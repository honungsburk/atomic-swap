import { Flex, Text, Spacer, Button, useColorMode } from "@chakra-ui/react";
import { Layout } from "./Layout";
import * as Icons from "../../components/Icons";

export default function Theme(): JSX.Element {
  return (
    <Layout header="Theme" hasBackButton>
      <Flex alignItems={"center"}>
        <Text fontWeight={"bold"} fontSize={18}>
          Color Mode
        </Text>
        <Spacer></Spacer>
        <ColorModeSwitch />
      </Flex>
    </Layout>
  );
}

function ColorModeSwitch() {
  const { colorMode, toggleColorMode } = useColorMode();
  if (colorMode === "light") {
    return (
      <Button
        leftIcon={<Icons.DarkTheme />}
        colorScheme="accentDarkMode"
        onClick={() => toggleColorMode()}
      >
        Dark
      </Button>
    );
  } else {
    return (
      <Button
        leftIcon={<Icons.LightTheme />}
        colorScheme="accent"
        onClick={() => toggleColorMode()}
      >
        Light
      </Button>
    );
  }
}
