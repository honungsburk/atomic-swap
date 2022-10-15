import React, { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import * as StoreZ from "src/Store";

import { useToast } from "@chakra-ui/react";
import PageErrorBoundary from "./components/ErrorBoundary/PageErrorBoundary";

import { ChannelState } from "./Network/Channel";
import * as PWA from "./Hooks/PWA";
import Loading from "./Pages/Loading";

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
  const session = StoreZ.Session.use((state) => state.session);

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

  return (
    <PageErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route
              path="/session/:theirID"
              element={
                <PageErrorBoundary>
                  <Trade />
                </PageErrorBoundary>
              }
            />
            <Route
              path="/session/"
              element={
                <PageErrorBoundary>
                  <Trade />
                </PageErrorBoundary>
              }
            />
            <Route
              path="/home"
              element={
                <PageErrorBoundary>
                  <Home />
                </PageErrorBoundary>
              }
            />
            <Route
              path="/"
              element={
                <PageErrorBoundary>
                  {displayMode === "standalone" ? <Trade /> : <Home />}
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
