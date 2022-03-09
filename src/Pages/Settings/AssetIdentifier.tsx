import {
  Box,
  VStack,
  Flex,
  HStack,
  Text,
  Spacer,
  CloseButton,
  Center,
  useColorModeValue,
  useBreakpointValue,
} from "@chakra-ui/react";
import * as Icons from "../../components/Icons";
import * as CardanoUtil from "../../Cardano/Util";
import { IAssetIdentifierData } from "../../Storage/DB";
import Hidden from "../../components/Hidden";
import TestnetTag from "../../components/TestnetTag";
import CopyText from "./CopyText";
import * as Extra from "../../Util/Extra";

export default function AssetIdentifier(props: {
  assetIdentifier: IAssetIdentifierData;
  onDelete: () => void;
  size: "full" | "compressed";
}): JSX.Element {
  const colorMode = useColorModeValue(
    {
      bgColor: "accent.500",
      color: "black",
    },
    {
      bgColor: "accentDarkMode.700",
      color: "white",
    }
  );
  const layout: "vertical" | "horizontal" | undefined = useBreakpointValue({
    base: "vertical",
    sm: "horizontal",
  });

  const assetIDType: "assetID" | "policyID" | "unknown" =
    CardanoUtil.assetIdentifierType(props.assetIdentifier.identifier);

  let extra = <></>;
  let bgStatus = "failure.500";
  let colorStatus = "white";
  let icon = <Icons.Error />;

  if (props.assetIdentifier.list === "Whitelist") {
    bgStatus = "white";
    colorStatus = "black";
    icon = <Icons.Whitelist />;
  } else if (props.assetIdentifier.list === "Blacklist") {
    bgStatus = "black";
    colorStatus = "white";
    icon = <Icons.Blacklist />;
  }

  if (assetIDType === "unknown") {
    icon = <Icons.Error />;
    bgStatus = "failure.500";
    extra = (
      <Center>
        <Text>Not a valid assetID/policyID</Text>
      </Center>
    );
  }

  const text =
    layout === "vertical"
      ? Extra.ellipsis(props.assetIdentifier.identifier, 9, 4)
      : props.assetIdentifier.identifier;

  return (
    <Box
      minWidth={["100%"]}
      background={colorMode.bgColor}
      color={colorMode.color}
      rounded={8}
      overflow="hidden"
      width={"100%"}
      p={1}
    >
      <VStack align={"left"} spacing={0}>
        <Flex>
          <HStack
            fontWeight="bold"
            backgroundColor={bgStatus}
            color={colorStatus}
            px={2}
            rounded={8}
          >
            {icon}
            <Text>{props.assetIdentifier.name}</Text>
          </HStack>
          <Spacer />
          <Center px={2}>
            <CopyText
              fontSize={12}
              copy={props.assetIdentifier.identifier}
              text={text}
            ></CopyText>
          </Center>

          <Hidden
            isHidden={props.assetIdentifier.networkID === "Mainnet"}
            hasSpace={true}
          >
            <TestnetTag size={"xs"} variant="outline" />
          </Hidden>
          <Center>
            <CloseButton onClick={() => props.onDelete()} />
          </Center>
        </Flex>
        {extra}
      </VStack>
    </Box>
  );
}
