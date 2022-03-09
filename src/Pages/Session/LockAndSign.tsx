import { Box, Button, HStack, VStack } from "@chakra-ui/react";
import React from "react";
import { Lock, Unlock } from "../../components/Icons";
import ToolTip from "../../components/ToolTip";

type LockAndSignProps = {
  isMatching: boolean;
  isLocked: boolean;
  theyAreLocked: boolean;
  onLock: () => void;
  onUnlock: () => void;
  onSign: () => void;
};

export default function LockAndSign(props: LockAndSignProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const lockIcon = (b: boolean) => {
    if (b) {
      return (
        <ToolTip label="Assets are locked">
          <Box>
            <Lock fontSize={24} />
          </Box>
        </ToolTip>
      );
    } else {
      return (
        <ToolTip label="Assets are unlocked">
          <Box>
            <Unlock fontSize={24} />
          </Box>
        </ToolTip>
      );
    }
  };

  return (
    <VStack>
      <HStack>
        {lockIcon(props.isLocked)}
        {props.isLocked ? (
          <Button
            onClick={props.onUnlock}
            variant={"outline"}
            colorScheme="primary"
          >
            UNLOCK
          </Button>
        ) : (
          <Button onClick={props.onLock} colorScheme="primary">
            LOCK
          </Button>
        )}
        {lockIcon(props.theyAreLocked)}
      </HStack>
      <Button
        disabled={!props.isLocked || !props.isMatching}
        isLoading={isLoading}
        colorScheme="success"
        loadingText="Creating Tx"
        onClick={() => {
          setIsLoading(true);
          props.onSign();
          setIsLoading(false);
        }}
      >
        SIGN
      </Button>
    </VStack>
  );
}
