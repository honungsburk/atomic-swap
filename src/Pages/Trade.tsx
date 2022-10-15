import React from "react";
import { useParams } from "react-router-dom";
import Session from "./Session";
import HasNoWallet from "./Session/HasNoWallet";
import PendingTrade from "./Session/PendingTrade";
import * as Store from "src/Store";

export default function Trade() {
  const { theirID } = useParams();
  const session = Store.Session.use((s) => s.session);
  const channelState = Store.ChannelState.use((s) => s.channelState);
  const hasPendingTrade = Store.PendingTransaction.use(
    (s) => s.pendingTransactions.length > 0
  );

  React.useEffect(() => {
    if (channelState !== "Connected" && session && theirID) {
      session.connectTo(theirID);
    }
  }, [session, channelState, theirID]);

  if (hasPendingTrade) {
    return <PendingTrade></PendingTrade>;
  } else if (window.cardano === undefined) {
    return <HasNoWallet />;
  } else {
    return <Session />;
  }
}
