import {
  Box,
  BoxProps,
  Center,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import ToolTip from "../../components/ToolTip";
import Copy from "../../components/Copy";

export type CopyTextProps = {
  copy: string;
  text: string;
} & BoxProps;

export default function CopyText(props: CopyTextProps): JSX.Element {
  const colorMode = useColorModeValue(
    { hoverColor: "rgba(0, 0, 0, 0.2)" },
    { hoverColor: "rgba(255, 255, 255, 0.2)" }
  );
  const { copy, text, ...rest } = props;

  return (
    <ToolTip label={copy}>
      <Box {...rest}>
        <Copy label={"Copied!"} copy={copy}>
          <Center
            px={3}
            py={1}
            rounded={20}
            _hover={{ bgColor: colorMode.hoverColor }}
          >
            <Text>{text}</Text>
          </Center>
        </Copy>
      </Box>
    </ToolTip>
  );
}
