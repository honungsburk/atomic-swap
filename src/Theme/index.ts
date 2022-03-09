import { mode } from "@chakra-ui/theme-tools";
import { extendTheme } from "@chakra-ui/react";
import colors from "./colors";
import button from "./components/button";
import input from "./components/input";
import dialogBox from "./components/dialogBox";
import { Dict } from "@chakra-ui/utils";
import { menu } from "./components/menu";
import testnetTag from "./components/testnetTag";

const global = (props: Dict<any>) => ({
  body: {
    color: mode("black", "white")(props),
    bg: mode("background.light", "background.dark")(props),
  },
});

const shadows = {
  outline: "0 0 0 3px " + colors.primary[300],
};

export const Theme = extendTheme({
  styles: {
    global: global,
  },
  components: {
    TestnetTag: testnetTag,
    DialogBox: dialogBox,
    Input: input,
    Button: button,
    Menu: menu,
  },
  colors: colors,
  shadows,
  initialColorMode: "dark",
  useSystemColorMode: false,
});

export default Theme;
