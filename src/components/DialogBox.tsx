import {
  Box,
  Flex,
  Spacer,
  CloseButton,
  Text,
  Center,
  BoxProps,
  useMultiStyleConfig,
  HStack,
} from "@chakra-ui/react";

type DialogBoxProps = {
  onClose?: () => void;
  icon?: JSX.Element;
  headerText?: string;
  colorScheme?: string;
} & BoxProps;

// children: JSX.Element | string | (JSX.Element | string)[];
// colorScheme?: "success" | "failure" | "primary";
export function DialogBox(props: DialogBoxProps): JSX.Element {
  const { onClose, icon, headerText, colorScheme, ...rest } = props;
  const styles = useMultiStyleConfig("DialogBox", { colorScheme: colorScheme });

  return (
    <Box __css={styles.container} {...rest}>
      {onClose || icon || headerText ? (
        <Box __css={styles.header}>
          <Flex>
            <HStack>
              <Center>{icon ? icon : <></>}</Center>
              {headerText && icon ? <Text>{"-"}</Text> : <></>}
              {headerText ? <Text>{headerText}</Text> : <></>}
            </HStack>
            <Spacer />
            {onClose ? <CloseButton onClick={onClose} /> : <></>}
          </Flex>
        </Box>
      ) : (
        <></>
      )}
      <Box __css={styles.childrenContainer}>{props.children}</Box>
    </Box>
  );
}
