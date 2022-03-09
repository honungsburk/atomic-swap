import { HStack, Text, useColorModeValue } from "@chakra-ui/react";
import Copy from "./Copy";
import ToolTip from "./ToolTip";
import { ContentCopy, Link } from "./Icons";

function CopyCard(props: { value: string; isLink?: boolean }) {
  const colorMode = useColorModeValue(
    { link: "black", bgColor: "accent.500", hoverBgColor: "accent.600" },
    {
      link: "white",
      bgColor: "accentDarkMode.700",
      hoverBgColor: "accentDarkMode.500",
    }
  );

  const icon = props.isLink ? (
    <Link color={colorMode.link} fontSize={24} />
  ) : (
    <ContentCopy color={colorMode.link} fontSize={24} />
  );

  return (
    <Copy label={props.value} copy={props.value}>
      <ToolTip label="Copy Invite Link">
        <HStack
          aria-label="Copy Invite Link"
          p={4}
          rounded={8}
          bgColor={colorMode.bgColor}
          _hover={{
            bgColor: colorMode.hoverBgColor,
          }}
        >
          {icon}
          <Text
            fontSize="md"
            width={300}
            align={"center"}
            wordBreak={"break-all"}
          >
            {props.value}
          </Text>
        </HStack>
      </ToolTip>
    </Copy>
  );
}

export default CopyCard;
