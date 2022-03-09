import { VStack, Text, Button } from "@chakra-ui/react";
import React from "react";
import * as Icons from "../../components/Icons";
import { DialogBox } from "../../components/DialogBox";

export default function AcceptOfferPrompt(props: {
  onSign: () => void;
  onReject: () => void;
}) {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <DialogBox icon={<Icons.Info />} headerText="Respond">
      <VStack>
        <Text fontSize={24}>Accept Offer</Text>

        <VStack>
          <Button
            onClick={() => {
              setIsLoading(true);
              props.onSign();
              setIsLoading(false);
            }}
            colorScheme="success"
            isLoading={isLoading}
            loadingText="Creating Tx"
          >
            SIGN
          </Button>

          <Button onClick={props.onReject} colorScheme="failure">
            REJECT
          </Button>
        </VStack>
      </VStack>
    </DialogBox>
  );
}
