import type { StyleFunctionProps } from "@chakra-ui/theme-tools";
import defaultTheme from "@chakra-ui/theme";
import { mode } from "@chakra-ui/theme-tools";
import { ComponentStyleConfig } from "@chakra-ui/react";

const ghostIconButton = (props: StyleFunctionProps) => {
  return {
    ...defaultTheme.components.Button.variants.ghost(props),
    _focus: {
      bg: mode("darken.200", "lighten.200")(props),
    },
    _active: {
      bg: mode("darken.300", "lighten.300")(props),
    },
    _hover: { bg: mode("darken.200", "lighten.200")(props) },
  };
};

const button: ComponentStyleConfig = {
  variants: {
    ghost: ghostIconButton,
  },
};

export default button;
