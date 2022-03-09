import { Box } from "@chakra-ui/react";

/**
 * All you to easily hide elements in the DOM given a condition
 *
 * @param props
 * @returns
 */
export default function Hidden(props: {
  hasSpace?: boolean;
  isHidden?: boolean;
  children: string | JSX.Element | (string | JSX.Element)[];
}): JSX.Element {
  if (props.hasSpace) {
    if (props.isHidden) {
      return <Box visibility="hidden">{props.children}</Box>;
    } else {
      return <>{props.children}</>;
    }
  } else {
    if (props.isHidden) {
      return <></>;
    } else {
      return <>{props.children}</>;
    }
  }
}
