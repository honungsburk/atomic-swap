import { BoxProps, Center, Text, useStyleConfig } from "@chakra-ui/react";
import ToolTip from "./ToolTip";

export type TestnetTagProps = {
  size: "xs" | "sm" | "md" | "lg";
  variant: "solid" | "outline";
} & BoxProps;

export default function TestnetTag(props: TestnetTagProps) {
  const { size, variant, ...rest } = props;
  const styles = useStyleConfig("TestnetTag", { size, variant } as any);
  return (
    <ToolTip label="Cardano Testnet">
      <Center __css={styles} {...rest}>
        Testnet
      </Center>
    </ToolTip>
  );
}
