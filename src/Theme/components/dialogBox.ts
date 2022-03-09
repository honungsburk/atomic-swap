import type { ComponentStyleConfig } from "@chakra-ui/theme";
import { mode, transparentize } from "@chakra-ui/theme-tools";
import * as ThemeTools from "@chakra-ui/theme-tools";

const dialogBox: ComponentStyleConfig = {
  parts: ["container", "header", "seperator", "childrenContainer"],
  baseStyle: (props) => {
    const { colorScheme: c, theme } = props;
    let light = "black";
    let dark = "white";
    if (c !== "basic") {
      light = `${c}.500`;
      dark = transparentize(`${c}.500`, 0.6)(theme);
    }
    let textLight = "black";
    let textDark = "black";

    if (ThemeTools.isDark(light)(theme)) {
      textLight = "white";
    }

    if (ThemeTools.isDark(dark)(theme)) {
      textDark = "white";
    }

    return {
      container: {
        border: "2px",
        borderColor: mode(light, dark)(props),
        rounded: 8,
      },
      header: {
        p: 1,
        bgColor: mode(light, dark)(props),
        color: mode(textLight, textDark)(props),
      },
      seperator: {
        p: 2,
      },
      childrenContainer: {
        p: 2,
      },
    };
  },
  sizes: {},
  // Two variants: outline and solid
  variants: {},
  // The default size and variant values
  defaultProps: {
    colorScheme: "basic",
    // size: 'md',
    // variant: 'outline',
  },
};

export default dialogBox;
