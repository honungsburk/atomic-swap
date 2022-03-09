// import type { ComponentSingleStyleConfig } from "@chakra-ui/theme";

const testnetTag = {
  baseStyle: {
    fontWeight: "bold",
    textTransform: "uppercase",
    cursor: "default",
  },
  sizes: {
    xs: {
      fontSize: 10,
      px: 1,
      py: 0,
      rounded: 2,
    },
    sm: {
      fontSize: 12,
      px: 2,
      py: 1,
      rounded: 2,
    },
    md: {
      fontSize: 16,
      px: 4,
      py: 2,
      rounded: 4,
    },
    lg: {
      fontSize: 20,
      px: 4,
      py: 2,
      rounded: 4,
    },
  },
  // Two variants: outline and solid
  variants: {
    solid: {
      bg: "secondary.500",
      color: "white",
    },
    outline: {
      borderColor: "secondary.500",
      color: "secondary.500",
      borderWidth: 2,
    },
  },
  // The default size and variant values
  defaultProps: {
    size: "md",
    variant: "solid",
  },
};

export default testnetTag;
