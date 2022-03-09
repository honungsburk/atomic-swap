import defaultTheme from "@chakra-ui/theme";
import { StyleFunctionProps } from "@chakra-ui/theme-tools";
import colors from "../colors";
import { mode } from "@chakra-ui/theme-tools";

const input = {
  variants: {
    outline: (props: StyleFunctionProps) => ({
      ...defaultTheme.components.Input.variants.outline(props),
      field: {
        ...defaultTheme.components.Input.variants.outline(props).field,
        borderWidth: 2,
        borderColor: mode(
          colors.accent.default,
          colors.accentDarkMode.default
        )(props),
        color: mode(
          colors.accent.default,
          colors.accentDarkMode.default
        )(props),
        _hover: {
          borderColor: mode(
            colors.accent[800],
            colors.accentDarkMode[200]
          )(props),
          color: mode(colors.black, colors.white)(props),
        },
        _focus: {
          color: mode(colors.black, colors.white)(props),
        },
      },
    }),
    filled: {},
  },
  defaultProps: {
    focusBorderColor: colors.primary[500],
  },
};

export default input;
