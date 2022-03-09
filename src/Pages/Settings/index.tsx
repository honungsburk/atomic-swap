import { VStack } from "@chakra-ui/react";
import { Suspense, lazy } from "react";
import { Layout } from "./Layout";
import { Route, Routes } from "react-router-dom";
import SettingPageLink from "./SettingPageLink";
import Loading from "../Loading";

// Code splitting
const Theme = lazy(() => import("./Theme"));
const NotFound = lazy(() => import("../NotFound"));
const AssetVerification = lazy(() => import("./AssetVerification"));

export default function Settings(): JSX.Element {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<SettingsNav />} />
        <Route path="/theme" element={<Theme />} />
        <Route path="/asset-verification" element={<AssetVerification />} />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function SettingsNav(): JSX.Element {
  return (
    <Layout header="Settings">
      <VStack>
        <SettingPageLink name="Theme" link="./theme" />
        <SettingPageLink
          name="Asset Verification"
          link="./asset-verification"
          isBeta={true}
        />
      </VStack>
    </Layout>
  );
}
