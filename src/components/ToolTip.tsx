import { Tooltip, TooltipProps } from "@chakra-ui/react";

function ToolTip(
  props: { label: React.ReactNode; mode?: "light" | "dark" } & TooltipProps
) {
  const { label, mode, bg, color, ...rest } = props;

  let modeBgColor = undefined;
  let modeColor = undefined;

  if (mode === "light") {
    modeBgColor = "gray.100";
    modeColor = "black";
  } else if (mode === "dark") {
    modeBgColor = "gray.700";
    modeColor = "white";
  }

  return (
    <Tooltip
      hasArrow
      label={label}
      bg={modeBgColor ? modeBgColor : bg}
      color={modeColor ? modeColor : color}
      {...rest}
    >
      {props.children}
    </Tooltip>
  );
}

export default ToolTip;
