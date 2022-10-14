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
  const [hasPendingTrade, setHasPendingTrade] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (props.store !== undefined) {
      const pendingTx = props.store.getPendingTx();
      setHasPendingTrade(pendingTx !== undefined);
      return props.store.on("TransactionEntry", (pendingTx) => {
        setHasPendingTrade(pendingTx !== undefined);
      });
    }
  }, [props.store]);

  // TODO: fix this shit
  if (theirID !== undefined && session !== undefined) {
    session.connectTo(theirID); // Okay to call even if already connected
  }

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
