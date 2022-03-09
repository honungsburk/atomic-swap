import {
  HStack,
  Flex,
  Center,
  Image,
  Text,
  Spacer,
  Avatar,
  VStack,
  Box,
  useColorModeValue,
} from "@chakra-ui/react";
import UnitDisplay from "./UnitDisplay";
import * as CardanoAsset from "../Cardano/Asset";
import * as CardanoUtil from "../Cardano/Util";
import * as Extra from "../Util/Extra";
import adaLight from "../assets/img/ada-light-128x128.png";
import adaDark from "../assets/img/ada-dark-128x128.png";

function AssetMini(props: {
  asset: CardanoAsset.Asset;
  onClick?: (asset: CardanoAsset.Asset) => void;
}) {
  let fingerPrint: string | undefined = undefined;

  const colorMode = useColorModeValue(
    {
      color: "black",
      bgColor: "accent.500",
      bgHoverColor: "accent.600",
      bgActiveColor: "accent.700",
      colorADA: "white",
      bgColorADA: "accentDark.500",
      bgHoverColorADA: "accentDark.600",
      bgActiveColorADA: "accentDark.700",
      adaImg: adaLight,
    },
    {
      color: "white",
      bgColor: "accentDarkMode.600",
      bgHoverColor: "accentDarkMode.500",
      bgActiveColor: "accentDarkMode.400",
      colorADA: "black",
      bgColorADA: "accent.700",
      bgHoverColorADA: "accent.500",
      bgActiveColorADA: "accent.300",
      adaImg: adaDark,
    }
  );

  let color = colorMode.color;
  let bgColor = colorMode.bgColor;
  let hoverColor = colorMode.bgHoverColor;
  let activeBackground = colorMode.bgActiveColor;

  if (props.asset.kind === "NativeAsset") {
    fingerPrint = CardanoUtil.assetFingerprint(
      props.asset.metadata.hash,
      props.asset.metadata.assetName
    ).fingerprint();
  } else {
    color = colorMode.colorADA;
    bgColor = colorMode.bgColorADA;
    hoverColor = colorMode.bgHoverColorADA;
    activeBackground = colorMode.bgActiveColorADA;
  }

  const src =
    props.asset.kind === "ADA" ? colorMode.adaImg : props.asset.metadata.src;

  return (
    <Box
      as="button"
      lineHeight="1.2"
      transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
      bgColor={bgColor}
      color={color}
      borderRadius={"8px"}
      width={"100%"}
      mx={"4"}
      px={"4"}
      _hover={{ bgColor: hoverColor }}
      _active={{
        bg: activeBackground,
        transform: "scale(0.98)",
      }}
      onClick={() => {
        if (props.onClick !== undefined) {
          props.onClick(props.asset);
        }
      }}
    >
      <Flex height="48px" width={"100%"}>
        <HStack>
          <Center width="36px" height="36px" rounded="full" overflow="hidden">
            <Image
              draggable={false}
              width="full"
              src={src}
              ignoreFallback={props.asset.kind === "ADA"}
              fallback={
                <Avatar
                  width="full"
                  height="full"
                  name={props.asset.metadata.displayName}
                />
              }
            />
          </Center>
          {fingerPrint === undefined ? (
            <Text>{props.asset.metadata.displayName}</Text>
          ) : (
            <VStack spacing={-0.5} align={"left"} textAlign={"left"}>
              <Text>{props.asset.metadata.displayName}</Text>
              <Text fontSize={10} fontWeight={"light"}>
                {Extra.ellipsis(fingerPrint, 9, 4)}
              </Text>
            </VStack>
          )}
        </HStack>
        <Spacer />
        <Center>
          <UnitDisplay
            quantity={props.asset.amount}
            decimals={props.asset.metadata.decimals}
            symbol={""}
            hide={true}
          />
        </Center>
      </Flex>
    </Box>
  );
}

export default AssetMini;
