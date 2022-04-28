import React, { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { BasicWallet } from "cardano-web-bridge-wrapper/lib/BasicWallet";
import { Env } from "./Env";
import SessionHolder from "./Network/SessionHolder";
import * as NetworkSession from "./Network/Session";

import { useInterval, useToast } from "@chakra-ui/react";
import PageErrorBoundary from "./components/ErrorBoundary/PageErrorBoundary";

import Store, { TransactionEntryV1 } from "./Storage/Store";
import BlockFrostAPI from "./API/BlockFrost/BlockFrostAPI";
import * as Types from "./API/BlockFrost/Types";
import * as TxBuilder from "./Cardano/TxBuilder";
import { ChannelState } from "./Network/Channel";
import * as PWA from "./Hooks/PWA";
import Loading from "./Pages/Loading";

import * as CardanoSerializationLib from "@emurgo/cardano-serialization-lib-browser";

import Layout from "./Layout";

// Lazy load routes to allow for code splitting.
const Home = lazy(() => import("./Pages/Home"));
const Success = lazy(() => import("./Pages/Success"));
const WhitePaper = lazy(() => import("./Pages/WhitePaper"));
const ChangeLog = lazy(() => import("./Pages/ChangeLog"));
const Trade = lazy(() => import("./Pages/Trade"));
const Settings = lazy(() => import("./Pages/Settings"));
const FAQ = lazy(() => import("./Pages/FAQ"));
const NotFound = lazy(() => import("./Pages/NotFound"));

declare global {
  interface Window {
    cardano: any;
  }
}

function App() {
  const toast = useToast();
  const displayMode = PWA.getPWADisplayMode();

  // ENV
  const [wallet, setWallet] = React.useState<BasicWallet | undefined>(
    undefined
  );
  const [session, setSession] = React.useState<
    NetworkSession.Session | undefined
  >(undefined);
  const [store, setStore] = React.useState<Store | undefined>(undefined);
  const [pendingTx, setPendingTx] = React.useState<
    TransactionEntryV1 | undefined
  >(undefined);

  const [channelState, setChannelState] =
    React.useState<ChannelState>("Initalized");

  // Store
  React.useEffect(() => {
    const newStore = Store.create();
    setStore(newStore);
    setPendingTx(newStore.getPendingTx());
    newStore.on("TransactionEntry", setPendingTx);
  }, []);

  // pendingTx
  const wipePendingTx = () => {
    if (store !== undefined) {
      store.deletePendingTx();
      window.location.reload();
    }
  };

  const hasBeenAddedToBlockChain = async () => {
    if (pendingTx !== undefined) {
      const API = new BlockFrostAPI(pendingTx.networkID);
      const result = await API.txs(pendingTx.txHash);
      if (Types.isTransaction(result)) {
        wipePendingTx();
      }
    }
  };

  // Check if the time to live has run out
  React.useEffect(() => {
    const exec = async () => {
      if (pendingTx !== undefined) {
        hasBeenAddedToBlockChain();
        const API = new BlockFrostAPI(pendingTx.networkID);
        const latestBlock = await API.blocksLatest();
        if (Types.isBlock(latestBlock)) {
          if (latestBlock.slot > pendingTx.ttl) {
            wipePendingTx();
          }
        }
      }
    };
    exec();
  }, [pendingTx]);

  // Check if the previous transaction was found on the blockchain
  useInterval(hasBeenAddedToBlockChain, 30000);

  React.useEffect(() => {
    const update = async () => {
      if (wallet !== undefined && session !== undefined) {
        const networkID = await wallet.getNetworkId();
        session.updateMyNetworkID(networkID);

        const myAddress = await wallet.getChangeAddress();
        session.updateMyAddress(myAddress.to_address());

        const utxos = await wallet.getUtxos();
        session.updateMyUTxOs(utxos);
      }
    };
    update();
  }, [wallet, session]);

  // TTL Bound Update
  React.useEffect(() => {
    const update = async () => {
      if (wallet !== undefined && session !== undefined) {
        const networkID = await wallet.getNetworkId();
        const ttlBound = await TxBuilder.createTTLBound(networkID);
        session.updateMyTTLBound(ttlBound);
      }
    };
    update();
  }, [wallet, session]);

  // TOAST
  React.useEffect(() => {
    if (session !== undefined) {
      const clean1 = session.onError((err) => {
        toast({
          title: "Empty Session",
          description: "" + err,
          status: "info",
          duration: 9000,
          isClosable: true,
        });
      });
      const clean2 = session.onChannelState((state, previous) => {
        notifyChannelStateChange(previous, state, toast);
      });

      return () => {
        clean1();
        clean2();
      };
    }
  }, [toast, session]);

  // SESSION
  React.useEffect(() => {
    const newSession = SessionHolder.mkSession(CardanoSerializationLib);
    setSession(newSession);

    setChannelState(newSession.getChannelState());
    newSession.onChannelState((state) => {
      setChannelState(state);
    });

    const cleanup = () => {
      newSession.destroy();
    };
    window.addEventListener("beforeunload", cleanup);
    return () => {
      window.removeEventListener("beforeunload", cleanup);
    };
  }, []);

  const env: Env = {
    wallet: wallet,
    changeWallet: setWallet,
  };

  return (
    <PageErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route
            path="/"
            element={
              <Layout
                env={env}
                session={session}
                lib={CardanoSerializationLib}
              />
            }
          >
            <Route
              path="/session/:theirID"
              element={
                <PageErrorBoundary>
                  <Trade
                    env={env}
                    session={session}
                    store={store}
                    lib={CardanoSerializationLib}
                  />
                </PageErrorBoundary>
              }
            />
            <Route
              path="/session/"
              element={
                <PageErrorBoundary>
                  <Trade
                    env={env}
                    session={session}
                    store={store}
                    lib={CardanoSerializationLib}
                  />
                </PageErrorBoundary>
              }
            />
            <Route
              path="/home"
              element={
                <PageErrorBoundary>
                  <Home channelState={channelState} />
                </PageErrorBoundary>
              }
            />
            <Route
              path="/"
              element={
                <PageErrorBoundary>
                  {displayMode === "standalone" ? (
                    <Trade
                      env={env}
                      session={session}
                      store={store}
                      lib={CardanoSerializationLib}
                    />
                  ) : (
                    <Home channelState={channelState} />
                  )}
                </PageErrorBoundary>
              }
            />
            <Route
              path="/changelog"
              element={
                <PageErrorBoundary>
                  <ChangeLog />
                </PageErrorBoundary>
              }
            />
            <Route
              path="/settings/*"
              element={
                <PageErrorBoundary>
                  <Settings />
                </PageErrorBoundary>
              }
            />
            <Route
              path="/success"
              element={
                <PageErrorBoundary>
                  <Success />
                </PageErrorBoundary>
              }
            />
            <Route
              path="/faq"
              element={
                <PageErrorBoundary>
                  <FAQ />
                </PageErrorBoundary>
              }
            />
            <Route
              path="/whitepaper"
              element={
                <PageErrorBoundary>
                  <WhitePaper />
                </PageErrorBoundary>
              }
            />
            <Route
              path="/*"
              element={
                <PageErrorBoundary>
                  <NotFound />
                </PageErrorBoundary>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </PageErrorBoundary>
  );
}

function notifyChannelStateChange(
  previous: ChannelState,
  state: ChannelState,
  toast: any
) {
  if (state === "Connected" && previous !== "Connected") {
    toast({
      title: "Connected",
      description: "You have been connected!",
      status: "success",
      duration: 9000,
      isClosable: true,
      colorScheme: "purple",
    });
  } else if (state === "Destroyed" && previous !== "Destroyed") {
    toast({
      title: "Closed",
      description: "The channel was unexpectedly closed.",
      status: "error",
      duration: 9000,
      isClosable: true,
    });
  } else if (
    previous === "Connected" &&
    (state === "Initalized" || state === "Waiting" || state === "Reconnecting")
  ) {
    toast({
      title: "Closed",
      description: "You have been disconnected!",
      status: "info",
      duration: 9000,
      isClosable: true,
    });
  }
}

export default App;
