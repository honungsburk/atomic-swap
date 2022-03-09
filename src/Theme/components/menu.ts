import type {
  PartsStyleFunction,
  SystemStyleFunction,
} from "@chakra-ui/theme-tools";
import { mode } from "@chakra-ui/theme-tools";
import { ComponentStyleConfig } from "@chakra-ui/react";

const baseStyleList: SystemStyleFunction = (props: any) => {
  return {
    bg: mode("accent.500", "accentDarkMode.600")(props),
  };
};

const baseStyleItem: SystemStyleFunction = (props: any) => {
  return {
    _focus: {
      bg: mode("darken.200", "lighten.200")(props),
    },
    _active: {
      bg: mode("darken.300", "lighten.300")(props),
    },
    _expanded: {
      bg: mode("darken.200", "lighten.200")(props),
    },
  };
};

// Example: https://github.com/chakra-ui/chakra-ui/blob/main/packages/theme/src/components/menu.ts
const baseStyle: PartsStyleFunction<any> = (props) => ({
  list: baseStyleList(props),
  item: baseStyleItem(props),
  // button: baseStyleButton,
  // groupTitle: baseStyleGroupTitle,
  // command: baseStyleCommand,
  // divider: baseStyleDivider,
});

export const menu: ComponentStyleConfig = {
  parts: ["menu", "item"],
  baseStyle: baseStyle,
};
