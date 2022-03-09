import { Tag, TagProps } from "@chakra-ui/react";
import ToolTip from "./ToolTip";

/**
 * Features that are in Beta will receieve the Beta Tag
 *
 * @param props
 * @returns
 */
export default function BetaTag(props: TagProps): JSX.Element {
  return (
    <ToolTip label="This feature is in BETA and can be changed at any time.">
      <Tag colorScheme="primary" {...props}>
        BETA
      </Tag>
    </ToolTip>
  );
}
