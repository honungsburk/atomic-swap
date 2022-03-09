import {
  Flex,
  Spacer,
  Text,
  useColorModeValue,
  HStack,
} from "@chakra-ui/react";
import * as Icons from "../../components/Icons";
import { Link as ReachLink } from "react-router-dom";
import BetaTag from "../../components/BetaTag";
import Hidden from "../../components/Hidden";

export default function SettingPageLink(props: {
  name: string;
  link: string;
  isBeta?: boolean;
}): JSX.Element {
  const colorMode = useColorModeValue(
    {
      bgHover: "accent.200",
    },
    { bgHover: "accentDarkMode.800" }
  );
  return (
    <Flex
      as={ReachLink}
      to={props.link}
      rounded="8"
      p={2}
      width="100%"
      alignItems={"center"}
      cursor="pointer"
      _hover={{ bg: colorMode.bgHover }}
    >
      <HStack>
        <Text fontWeight={"bolds"} fontSize={"3xl"}>
          {props.name}
        </Text>
        <Hidden isHidden={!props.isBeta}>
          <BetaTag />
        </Hidden>
      </HStack>
      <Spacer />
      <Icons.ArrowRight boxSize={6} />
    </Flex>
  );
}
