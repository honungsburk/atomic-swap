import React from "react";
import { useParams } from "react-router-dom";
import SStore from "../Storage/Store";
import Session from "./Session";
import HasNoWallet from "./Session/HasNoWallet";
import PendingTrade from "./Session/PendingTrade";
import * as Store from "src/Store";

export default function Trade(props: { store?: SStore }) {
  const { theirID } = useParams();
  const session = Store.Session.use((s) => s.session);
  const channelState = Store.ChannelState.use((s) => s.channelState);
  const [hasPendingTrade, setHasPendingTrade] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (channelState !== "Connected" && session && theirID) {
      session.connectTo(theirID);
    }
  }, [session, channelState, theirID]);

  React.useEffect(() => {
    if (props.store !== undefined) {
      const pendingTx = props.store.getPendingTx();
      setHasPendingTrade(pendingTx !== undefined);
      return props.store.on("TransactionEntry", (pendingTx) => {
        setHasPendingTrade(pendingTx !== undefined);
      });
    }
  }, [props.store]);

  if (hasPendingTrade) {
    return <PendingTrade store={props.store}></PendingTrade>;
  } else if (window.cardano === undefined) {
    return <HasNoWallet />;
  } else if (session === undefined) {
    return <></>; // TODO: display error message
  } else if (props.store === undefined) {
    return <></>; // TODO: display error message
  } else {
    return <Session store={props.store} />;
  }
}
