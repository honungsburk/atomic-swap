import { Box, BoxProps } from "@chakra-ui/layout";
import { useClipboard } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/tooltip";

function Copy(props: { label: string; copy: string } & BoxProps) {
  const { label, copy, children, onClick, ...rest } = props;
  const { hasCopied, onCopy } = useClipboard(copy);
  return (
    <Tooltip hasArrow isOpen={hasCopied} label={label}>
      <Box
        cursor="pointer"
        onClick={(event) => {
          onCopy();
          if (onClick !== undefined) {
            onClick(event);
          }
        }}
        {...rest}
      >
        {children}
      </Box>
    </Tooltip>
  );
}

export default Copy;
