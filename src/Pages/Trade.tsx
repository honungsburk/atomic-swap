import React from "react";
import { useParams } from "react-router-dom";
import { Env } from "../Env";
import { ChannelState } from "../Network/Channel";
import * as NetworkSession from "../Network/Session";
import Store from "../Storage/Store";
import Session from "./Session";
import HasNoWallet from "./Session/HasNoWallet";
import PendingTrade from "./Session/PendingTrade";
import * as CardanoSerializationLib from "@emurgo/cardano-serialization-lib-browser";

export default function Trade(props: {
  env: Env;
  session?: NetworkSession.Session;
  store?: Store;
  lib?: typeof CardanoSerializationLib;
}) {
  const { theirID } = useParams();
  const [hasPendingTrade, setHasPendingTrade] = React.useState<boolean>(false);
  const [channelState, setChannelState] =
    React.useState<ChannelState>("Initalized");

  React.useEffect(() => {
    if (props.store !== undefined) {
      const pendingTx = props.store.getPendingTx();
      setHasPendingTrade(pendingTx !== undefined);
      return props.store.on("TransactionEntry", (pendingTx) => {
        setHasPendingTrade(pendingTx !== undefined);
      });
    }
  }, [props.store]);

  React.useEffect(() => {
    if (props.session !== undefined) {
      setChannelState(props.session.getChannelState());
      return props.session.onChannelState(setChannelState);
    }
  }, [props.session]);

  if (theirID !== undefined && props.session !== undefined) {
    props.session.connectTo(theirID); // Okay to call even if already connected
  }

  if (hasPendingTrade) {
    return <PendingTrade store={props.store}></PendingTrade>;
  } else if (window.cardano === undefined) {
    return <HasNoWallet />;
  } else if (props.session === undefined) {
    return <></>; // TODO: display error message
  } else if (props.store === undefined) {
    return <></>; // TODO: display error message
  } else if (props.lib === undefined) {
    return <></>; // TODO: display error message
  } else {
    return (
      <Session
        lib={props.lib}
        onWalletChange={props.env.changeWallet}
        channelState={channelState}
        session={props.session}
        store={props.store}
        wallet={props.env.wallet}
      />
    );
  }
}
