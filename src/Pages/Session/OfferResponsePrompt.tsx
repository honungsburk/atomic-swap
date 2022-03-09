import { Text } from "@chakra-ui/react";
import { DialogBox } from "../../components/DialogBox";
import * as Icons from "../../components/Icons";

export default function OfferReponsePrompt(props: {
  reponse: "Accepted" | "Rejected";
  onReset: () => void;
}) {
  let icon = <Icons.Success />;
  let color = "success";
  let titleText = "Offer Accepted!";

  if (props.reponse === "Rejected") {
    icon = <Icons.Error />;
    titleText = "Offer Rejected!";
    color = "failure";
  }

  return (
    <DialogBox
      icon={icon}
      headerText="Rejected"
      colorScheme={color}
      onClose={props.onReset}
      width={240}
    >
      {titleText}
    </DialogBox>
  );
}
