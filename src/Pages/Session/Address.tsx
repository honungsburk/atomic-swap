import { Center, Text, Box, useColorModeValue } from "@chakra-ui/react";
import * as Extra from "../../Util/Extra";
import * as Cardano from "@emurgo/cardano-serialization-lib-browser";
import Copy from "../../components/Copy";
import ToolTip from "../../components/ToolTip";
import { NetworkID } from "cardano-web-bridge-wrapper";

export default function Address(props: {
  isTesting: boolean;
  networkID: NetworkID | null;
  address: Cardano.Address | null;
}) {
  const colorMode = useColorModeValue(
    {
      color: "black",
      bgColor: "accent.500",
      bgHoverColor: "accent.700",
      colorTest: "white",
      bgTestColor: "secondary.500",
      bgHoverTestColor: "secondary.700",
    },
    {
      color: "white",
      bgColor: "accentDarkMode.700",
      bgHoverColor: "accentDarkMode.500",
      colorTest: "black",
      bgTestColor: "secondary.500",
      bgHoverTestColor: "secondary.300",
    }
  );

  let text = "No Address";
  let color = colorMode.color;
  let bgColor = colorMode.bgColor;
  let hoverColor = colorMode.bgHoverColor;
  const prefix = props.networkID === "Mainnet" ? "addr" : "addr_test";
  const address = props.address?.to_bech32(prefix);

  if (address !== undefined) {
    text = Extra.ellipsis(address, prefix.length + 5, 5);
  }

  let tooltip = "Address";

  if (props.isTesting) {
    color = colorMode.colorTest;
    bgColor = colorMode.bgTestColor;
    hoverColor = colorMode.bgHoverTestColor;
    tooltip = "Both sides are using the same wallet";
  }

  if (props.networkID == null) {
    text = "No Network";
  }

  const whatToCopy = address ? address : "";

  return (
    <ToolTip label={tooltip}>
      <Box>
        <Copy label={"Copied!"} copy={whatToCopy}>
          <Center
            px={3}
            py={1}
            rounded={20}
            color={color}
            bgColor={bgColor}
            _hover={{ bgColor: hoverColor }}
          >
            <Text fontSize={[8, null, null, 10]}>{text}</Text>
          </Center>
        </Copy>
      </Box>
    </ToolTip>
  );
}
