import { Box, HStack, useColorModeValue } from "@chakra-ui/react";

export type SelectGroupProps<A> = {
  selectedOption: string | undefined;
  options: { option: string; value: A }[];
  onClick: (value: A | undefined) => void;
};

export default function SelectGroup<A>(props: SelectGroupProps<A>) {
  const placement = (index: number) => {
    if (props.options.length === 1) {
      return "startend";
    } else if (index === 0) {
      return "start";
    } else if (index === props.options.length - 1) {
      return "end";
    } else {
      return "middle";
    }
  };

  return (
    <HStack spacing={0}>
      {props.options.map(({ option, value }, index) => (
        <SelectGroupButton
          key={index} // We will never move anything so using index will be fine
          text={option}
          placement={placement(index)}
          isSelected={props.selectedOption === option}
          onClick={() => {
            if (props.selectedOption === option) {
              props.onClick(undefined);
            } else {
              props.onClick(value);
            }
          }}
        />
      ))}
    </HStack>
  );
}

function SelectGroupButton(props: {
  text: string;
  placement: "start" | "middle" | "end" | "startend";
  isSelected: boolean;
  onClick: () => void;
}): JSX.Element {
  const colorMode = useColorModeValue(
    {
      borderColor: "accent.700",
      color: "accent.700",
      selectedColor: "accent.800",
      selectedTextColor: "white",
      selectedHoverColor: "accent.900",
    },
    {
      borderColor: "accentDarkMode.500",
      color: "accentDarkMode.500",
      selectedColor: "accentDarkMode.200",
      selectedTextColor: "black",
      selectedHoverColor: "accentDarkMode.100",
    }
  );

  let borderColor: string | undefined = colorMode.borderColor;
  let color = colorMode.color;
  let bgColor: string | undefined = undefined;

  let borderStartWidth = 0;
  let borderEndWidth = 0;
  let leftRound = 0;
  let rightRound = 0;

  if (props.placement === "startend") {
    borderStartWidth = 2;
    borderEndWidth = 2;
    leftRound = 4;
    rightRound = 4;
  } else if (props.placement === "start") {
    borderStartWidth = 2;
    borderEndWidth = 1;
    leftRound = 4;
  } else if (props.placement === "end") {
    borderStartWidth = 1;
    borderEndWidth = 2;
    rightRound = 4;
  } else if (props.placement === "middle") {
    borderStartWidth = 1;
    borderEndWidth = 1;
  }

  const hover: {
    borderColor: string;
    color: string;
    bg?: string;
  } = { borderColor: colorMode.selectedColor, color: colorMode.selectedColor };

  if (props.isSelected) {
    hover.borderColor = colorMode.selectedHoverColor;
    hover.bg = colorMode.selectedHoverColor;
    hover.color = colorMode.selectedTextColor;
    borderColor = colorMode.selectedColor;
    bgColor = colorMode.selectedColor;
    color = colorMode.selectedTextColor;
  }

  return (
    <Box
      color={color}
      bg={bgColor}
      roundedLeft={leftRound}
      roundedRight={rightRound}
      onClick={() => props.onClick()}
      cursor={"pointer"}
      borderEndWidth={borderEndWidth}
      borderStartWidth={borderStartWidth}
      borderTopWidth={2}
      borderBottomWidth={2}
      px={2}
      py={1}
      borderColor={borderColor}
      _hover={hover}
    >
      {props.text}
    </Box>
  );
}
