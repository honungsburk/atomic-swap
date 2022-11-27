import {
  Text,
  VStack,
  Button,
  useDisclosure,
  Flex,
  Spacer,
  useToast,
  Heading,
  useBreakpointValue,
  Link,
} from "@chakra-ui/react";
import React from "react";
import type {
  Address,
  AssetName,
  BigNum,
  ScriptHash,
  Value,
} from "@emurgo/cardano-serialization-lib-browser";
import * as CardanoSerializationLib from "@emurgo/cardano-serialization-lib-browser";
import { CreditCard, Ghost } from "../components/ChakraKawaii";
import AssetSelector from "../components/AssetSelector";

import * as CardanoAsset from "../Cardano/Asset";
import * as NetworkSession from "../Network/Session";
import * as TxBuilder from "../Cardano/TxBuilder";
import {
  BasicWallet,
  isWebBridgeError,
  NetworkID,
} from "cardano-web-bridge-wrapper/lib";
import * as ValueExtra from "../Cardano/ValueExtra";
import * as BigNumExtra from "../Cardano/BigNumExtra";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import LockAndSign from "./Session/LockAndSign";
import { SelectedAsset } from "./Session/Types";
import AssetList from "./Session/AssetList";
import { KawaiiMood } from "react-kawaii";
import OfferReponsePrompt from "./Session/OfferResponsePrompt";
import AcceptOfferPrompt from "./Session/AcceptOfferPrompt";
import AssetListHeader from "./Session/AssetListHeader";
import QRCode from "../components/QRCode";
import WalletConnectButton from "../components/WalletConnectButton";
import * as colors from "../Theme/colors";
import Copy from "../components/Copy";
import ToolTip from "../components/ToolTip";
import * as Icons from "../components/Icons";
import { DialogBox } from "../components/DialogBox";
import * as Cardano from "@emurgo/cardano-serialization-lib-browser";
import * as StoreZ from "src/Store";
import { useAsync } from "src/Hooks/UseAsync";

function Session() {
  const wallet = StoreZ.Wallet.use((state) => state.wallet);
  const session = StoreZ.Session.use((s) => s.session);

  const layout: "vertical" | "horizontal" | undefined = useBreakpointValue({
    base: "vertical",
    lg: "horizontal",
  });
  const navigate = useNavigate();
  const toast = useToast();
  const commission = Cardano.BigNum.from_str("1000000");

  ////////////////////////////////////////////////////////////////////////////////
  // Available Value
  ////////////////////////////////////////////////////////////////////////////////

  const [availableValue, setAvailableValue] = React.useState<{
    val: Value;
    networkID: NetworkID;
  }>({ val: Cardano.Value.zero(), networkID: "Mainnet" });

  useAsync(
    async () => {
      if (wallet !== undefined) {
        const balance = await wallet.getBalance();
        const networkID = await wallet.getNetworkId();
        return { val: balance, networkID: networkID };
      } else {
        return undefined;
      }
    },
    (state) => {
      if (state !== undefined) {
        setAvailableValue(state);
      }
    },
    [wallet]
  );

  const [availableAssets, setAvailableAssets] = React.useState<
    CardanoAsset.Asset[]
  >([]);

  React.useEffect(() => {
    const assets = CardanoAsset.findMetadata(
      availableValue.networkID,
      availableValue.val
    );
    setAvailableAssets(assets);
  }, [availableValue]);

  ////////////////////////////////////////////////////////////////////////////////
  // Synced UI State
  ////////////////////////////////////////////////////////////////////////////////

  /////////////// My State

  // NetworkID

  const [myNetworkID, setMyNetworkID] = React.useState<NetworkID | null>(null);

  React.useEffect(() => {
    setMyNetworkID(session.getMyNetworkID());
    return session.onMyNetworkID(setMyNetworkID);
  }, [session]);

  // Selected Assets

  const [mySelectedAssets, setMySelectedAssets] = React.useState<
    SelectedAsset[]
  >([]);

  React.useEffect(() => {
    if (myNetworkID !== null) {
      const exec = async (value: Value) => {
        const assets = await deriveMySelectedAssets(
          availableValue.val,
          value,
          myNetworkID,
          Cardano
        );
        setMySelectedAssets(assets);
      };
      exec(session.getMyValue());
      return session.onMyValue(exec);
    }
  }, [session, myNetworkID, availableValue]);

  const selectedAssetsUnits: Set<string> = new Set();
  mySelectedAssets.forEach((asset) =>
    selectedAssetsUnits.add(CardanoAsset.makeID(asset))
  );

  // Lock

  const [myLock, setMyLock] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (session !== undefined) {
      setMyLock(session.getMyLock());
      return session.onMyLock(setMyLock);
    }
  }, [session]);

  // Address

  const [myAddress, setMyAddress] = React.useState<Address | null>(null);

  React.useEffect(() => {
    setMyAddress(session.getMyAddress());
    return session.onMyAddress((addr) => {
      setMyAddress(addr);
    });
  }, [session]);

  /////////////// Their State

  // NetworkID

  const [theirNetworkID, setTheirNetworkID] = React.useState<NetworkID | null>(
    null
  );

  React.useEffect(() => {
    setTheirNetworkID(session.getTheirNetworkID());
    return session.onTheirNetworkID(setTheirNetworkID);
  }, [session]);

  // Selected Assets

  const [theirSelectedAssets, setTheirSelectedAssets] = React.useState<
    CardanoAsset.Asset[]
  >([]);

  React.useEffect(() => {
    if (theirNetworkID !== null) {
      const exec = async (value: Value) => {
        const assets = await deriveTheirSelectedAssets(
          value,
          theirNetworkID,
          Cardano
        );
        setTheirSelectedAssets(assets);
      };
      exec(session.getTheirValue());
      return session.onTheirValue(exec);
    }
  }, [session, theirNetworkID]);

  // Lock

  const [theirLock, setTheirLock] = React.useState<boolean>(false);

  React.useEffect(() => {
    setTheirLock(session.getTheirLock());
    return session.onTheirLock(setTheirLock);
  }, [session]);

  // Address

  const [theirAddress, setTheirAddress] = React.useState<Address | null>(null);

  React.useEffect(() => {
    setTheirAddress(session.getTheirAddress());
    return session.onTheirAddress(setTheirAddress);
  }, [session]);

  ////////////////////////////////////////////////////////////////////////////////
  // Offer
  ////////////////////////////////////////////////////////////////////////////////

  const [offer, setOffer] = React.useState<NetworkSession.Offer | undefined>(
    undefined
  );

  const addPendingTx = StoreZ.PendingTransaction.use((s) => s.add);

  React.useEffect(() => {
    if (session !== undefined) {
      setOffer(session.getOffer());
      return session.onOffer((offer) => {
        setOffer(offer);
        if (offer?.kind === "OfferAccept") {
          toast({
            title: "Success!",
            description: "The transaction was submitted to the blockchain.",
            status: "success",
            duration: 9000,
            isClosable: true,
          });
          navigate("../success", { replace: true });
          const ttlRes = session.getNegotiatedTTL();
          if (ttlRes.err) {
            toast({
              title: ttlRes.val.title,
              description: ttlRes.val.details,
              status: "error",
              duration: 9000,
              isClosable: true,
            });
          }
          if (myNetworkID !== null && ttlRes.ok) {
            addPendingTx({
              txHash: offer.txID,
              ttl: ttlRes.val,
              networkID: myNetworkID,
            });
          }
        }
      });
    }
  }, [session, myNetworkID]);

  ////////////////////////////////////////////////////////////////////////////////
  // MissMatch!
  ////////////////////////////////////////////////////////////////////////////////

  // Check if there is conflict between our state and what they think our state is
  const [myTradeMatchTheirs, setMyTradeMatchTheirs] = React.useState<
    undefined | NetworkSession.TradeMissMatch
  >(undefined);

  React.useEffect(() => {
    const errors: NetworkSession.TradeMissMatch[] =
      session.getMissMatchErrors();
    if (errors.length > 0) {
      setMyTradeMatchTheirs(errors[0]);
    } else {
      setMyTradeMatchTheirs(undefined);
    }
    return session.onMissMatchErrors(
      (errors: NetworkSession.TradeMissMatch[]) => {
        if (errors.length > 0) {
          setMyTradeMatchTheirs(errors[0]);
        } else {
          setMyTradeMatchTheirs(undefined);
        }
      }
    );
  }, [session]);

  const getUrl = window.location;

  const layoutProps: LayoutProps = {
    isTesting:
      myAddress !== null &&
      myAddress?.to_bech32("addr") === theirAddress?.to_bech32("addr"),
    myAddress: myAddress,
    theirAddress: theirAddress,
    hasWallet: wallet !== undefined,
    link: `${getUrl.protocol}//${getUrl.host}/session/${session.getID()}`,
    myNetworkID: myNetworkID,
    iAmLocked: myLock,
    theirLock: theirLock,
    commission: commission,
    onAdaChange: (ada) => {
      session.updateMyADA(ada);
    },
    availableAssets: availableAssets.filter(
      (asset) => !selectedAssetsUnits.has(CardanoAsset.makeID(asset))
    ),
    mySelectedAssets: mySelectedAssets,
    updateNativeAsset: (hash, assetName, amount) => {
      session.addMyAsset(hash, assetName, amount);
    },
    tradeMissMatch: myLock ? myTradeMatchTheirs : undefined,
    offer: offer,
    theirNetworkID: theirNetworkID,
    theirSelectedAssets: theirSelectedAssets,
  };

  if (layout === "horizontal") {
    return <HorizontalLayout {...layoutProps} />;
  } else {
    return <VerticalLayout {...layoutProps} />;
  }
}

type LayoutProps = {
  isTesting: boolean;
  myAddress: Address | null;
  theirAddress: Address | null;
  hasWallet: boolean;
  link: string;
  myNetworkID: NetworkID | null;
  iAmLocked: boolean;
  theirLock: boolean;
  commission: BigNum;
  onAdaChange: (v: BigNum) => void;
  availableAssets: CardanoAsset.Asset[];
  mySelectedAssets: SelectedAsset[];
  updateNativeAsset: (
    scriptHash: ScriptHash,
    assetName: AssetName,
    amount: BigNum
  ) => void;

  tradeMissMatch: NetworkSession.TradeMissMatch | undefined;
  offer: NetworkSession.Offer | undefined;

  theirNetworkID: NetworkID | null;
  theirSelectedAssets: CardanoAsset.Asset[];
};

function HorizontalLayout(props: LayoutProps) {
  return (
    <Flex my={6}>
      <Spacer />
      <MySide
        isTesting={props.isTesting}
        address={props.myAddress}
        networkID={props.myNetworkID}
        isLocked={props.iAmLocked}
        commission={props.commission}
        onAdaChange={props.onAdaChange}
        availableAssets={props.availableAssets}
        selectedAssets={props.mySelectedAssets}
        addNativeAsset={props.updateNativeAsset}
      />
      <Spacer />
      <VStack spacing={8}>
        <Header />
        <SessionController
          numberOfAssets={
            props.mySelectedAssets.length + props.theirSelectedAssets.length
          }
          isTesting={props.isTesting}
          myLock={props.iAmLocked}
          theirLock={props.theirLock}
          offer={props.offer}
          missMatchError={props.tradeMissMatch}
        />
      </VStack>
      <Spacer />
      <TheirSide
        isLocked={props.iAmLocked}
        isTesting={props.isTesting}
        address={props.theirAddress}
        link={props.link}
        networkID={props.theirNetworkID}
        commission={props.commission}
        theirSelectedAssets={props.theirSelectedAssets}
      />
      <Spacer />
    </Flex>
  );
}

function VerticalLayout(props: LayoutProps) {
  return (
    <VStack my={3} spacing={12}>
      <MySide
        isTesting={props.isTesting}
        address={props.myAddress}
        networkID={props.myNetworkID}
        isLocked={props.iAmLocked}
        commission={props.commission}
        onAdaChange={props.onAdaChange}
        availableAssets={props.availableAssets}
        selectedAssets={props.mySelectedAssets}
        addNativeAsset={props.updateNativeAsset}
      />
      <TheirSide
        isLocked={props.iAmLocked}
        isTesting={props.isTesting}
        address={props.theirAddress}
        link={props.link}
        networkID={props.theirNetworkID}
        commission={props.commission}
        theirSelectedAssets={props.theirSelectedAssets}
      />
      <VStack>
        <Heading>Lock & Sign</Heading>
        <SessionController
          numberOfAssets={
            props.mySelectedAssets.length + props.theirSelectedAssets.length
          }
          isTesting={props.isTesting}
          myLock={props.iAmLocked}
          theirLock={props.theirLock}
          offer={props.offer}
          missMatchError={props.tradeMissMatch}
        />
      </VStack>
    </VStack>
  );
}

function toastOnTxFail(err: any, toast: any) {
  if (
    err instanceof TxBuilder.InsufficientNativeAssetError ||
    err instanceof TxBuilder.InsufficientAdaError
  ) {
    toast({
      title: "Insufficent Amount",
      description: err.message,
      status: "error",
      duration: 9000,
      isClosable: true,
    });
  } else if (isWebBridgeError(err)) {
    toast({
      title: "Wallet." + err.stringCode(),
      description: err.info,
      status: "error",
      duration: 9000,
      isClosable: true,
    });
  } else {
    toast({
      title: "Unknown Error",
      description: JSON.stringify(err),
      status: "error",
      duration: 9000,
      isClosable: true,
    });
  }
}

const assetWidths = ["100%", "md", "lg", "xl"];

function MySide(props: {
  isTesting: boolean;
  address: Address | null;
  isLocked: boolean;
  networkID: NetworkID | null;
  commission: BigNum;
  onAdaChange: (ada: BigNum) => void;
  availableAssets: CardanoAsset.Asset[];
  selectedAssets: SelectedAsset[];
  addNativeAsset: (
    scriptHash: ScriptHash,
    assetName: AssetName,
    amount: BigNum
  ) => void;
}) {
  const wallet = StoreZ.Wallet.use((state) => state.wallet);

  if (wallet) {
    return (
      <MyAssets
        isTesting={props.isTesting}
        address={props.address}
        networkID={props.networkID}
        isLocked={props.isLocked}
        commission={props.commission}
        onAdaChange={props.onAdaChange}
        availableAssets={props.availableAssets}
        selectedAssets={props.selectedAssets}
        addNativeAsset={props.addNativeAsset}
      />
    );
  } else {
    return <ConnectWallet />;
  }
}

function ConnectWallet() {
  return (
    <VStack spacing={6} width={assetWidths}>
      <AssetListHeader
        address={null}
        text="Connect Your Wallet"
        networkID={null}
        commission={Cardano.BigNum.zero()}
      />
      <CreditCard size={200} color={colors.default.characters.creditcard} />
      <WalletConnectButton />
    </VStack>
  );
}

function MyAssets(props: {
  isTesting: boolean;
  address: Address | null;
  isLocked: boolean;
  networkID: NetworkID | null;
  commission: BigNum;
  onAdaChange: (ada: BigNum) => void;
  availableAssets: CardanoAsset.Asset[];
  selectedAssets: SelectedAsset[];
  addNativeAsset: (
    scriptHash: ScriptHash,
    assetName: AssetName,
    amount: BigNum
  ) => void;
}) {
  return (
    <VStack spacing={6} width={assetWidths}>
      <AssetListHeader
        isTesting={props.isTesting}
        address={props.address}
        text="You Will Send"
        networkID={props.networkID}
        commission={props.commission}
      />

      {props.selectedAssets.length === 0 ? (
        <AssetListEmptyState version="YouWillSend" />
      ) : (
        <AssetList
          isLocked={props.isLocked}
          isEditable={!props.isLocked}
          assets={props.selectedAssets}
          onAdaChange={(ada) => {
            props.onAdaChange(ada);
          }}
          onAddNativeAsset={props.addNativeAsset}
        />
      )}

      {!props.isLocked ? (
        <AddAsset
          assets={props.availableAssets}
          onAddADA={() => props.onAdaChange(Cardano.BigNum.from_str("1000000"))}
          onAddNativeAsset={props.addNativeAsset}
        />
      ) : (
        <></>
      )}
    </VStack>
  );
}

function SessionController(props: {
  isTesting: boolean;
  numberOfAssets: number;
  offer: NetworkSession.Offer | undefined;
  myLock: boolean;
  theirLock: boolean;
  missMatchError: NetworkSession.TradeMissMatch | undefined;
}) {
  const wallet = StoreZ.Wallet.use((state) => state.wallet);
  const session = StoreZ.Session.use((state) => state.session);
  const toast = useToast();
  let component = <></>;

  if (wallet === undefined) {
    component = <></>;
  } else if (props.numberOfAssets <= 0) {
    component = (
      <DialogBox icon={<Icons.Info />} headerText="Info">
        Waiting for assets to be added
      </DialogBox>
    );
  } else if (props.offer === undefined) {
    component = (
      <LockAndSign
        isMatching={props.missMatchError === undefined && !props.isTesting}
        isLocked={props.myLock}
        theyAreLocked={props.theirLock}
        onLock={() => session.updateMyLock(true)}
        onUnlock={() => session.updateMyLock(false)}
        onSign={async () => {
          const ttlRes = session.getNegotiatedTTL();
          if (ttlRes.err) {
            toast({
              title: ttlRes.val.title,
              description: ttlRes.val.details,
              status: "error",
              duration: 9000,
              isClosable: true,
            });
          }

          const offer = buildOffer(session);
          if (offer !== undefined && ttlRes.ok) {
            try {
              const witnessSet = await TxBuilder.signTx(Cardano)(
                wallet,
                offer[0],
                offer[1],
                ttlRes.val
              );
              session.createOffer(witnessSet);
            } catch (err: any) {
              console.log(err);
              toastOnTxFail(err, toast);
            }
          }
        }}
      ></LockAndSign>
    );
  } else if (props.offer.kind === "TheyArePending") {
    component = (
      <DialogBox
        icon={<Icons.Info />}
        headerText=" Waiting"
        colorScheme="primary"
        maxWidth={240}
      >
        <Text textAlign={"center"}>Waiting for signature...</Text>
      </DialogBox>
    );
  } else if (props.offer.kind === "IAmPending") {
    const witness = props.offer.witness;
    component = (
      <AcceptOfferPrompt
        onReject={() => session.rejectOffer()}
        onSign={async () => {
          const ttlRes = session.getNegotiatedTTL();
          if (ttlRes.err) {
            toast({
              title: ttlRes.val.title,
              description: ttlRes.val.details,
              status: "error",
              duration: 9000,
              isClosable: true,
            });
          }

          const offer = buildOffer(session);
          if (offer !== undefined && ttlRes.ok) {
            try {
              const txID = await TxBuilder.makeTx(Cardano)(
                wallet,
                offer[0],
                offer[1],
                witness,
                ttlRes.val
              );
              session.acceptOffer(txID);
            } catch (err: any) {
              toastOnTxFail(err, toast);
            }
          }
        }}
      ></AcceptOfferPrompt>
    );
  } else if (props.offer.kind === "OfferAccept") {
    component = (
      <OfferReponsePrompt
        reponse={"Accepted"}
        onReset={() => session.resetOffer()}
      ></OfferReponsePrompt>
    );
  } else if (props.offer.kind === "OfferReject") {
    component = (
      <OfferReponsePrompt
        reponse={"Rejected"}
        onReset={() => session.resetOffer()}
      ></OfferReponsePrompt>
    );
  }
  return (
    <VStack>
      {component}
      {props.isTesting ? (
        <DialogBox
          icon={<Icons.Info />}
          headerText="Test Mode"
          colorScheme="secondary"
          maxWidth={240}
        >
          <Text textAlign={"center"}>
            You are in test mode and won&apos;t be able to sign.
          </Text>
        </DialogBox>
      ) : (
        <></>
      )}
      {props.missMatchError && session.getChannelState() === "Connected" ? (
        <DialogBox
          icon={<Icons.Error />}
          headerText="Trade Missmatch"
          colorScheme="primary"
          maxWidth={240}
        >
          <Text textAlign={"center"}>{props.missMatchError.msg}</Text>
        </DialogBox>
      ) : (
        <></>
      )}
    </VStack>
  );
}

function buildOffer(
  session: NetworkSession.Session
): [TxBuilder.OfferParams, TxBuilder.OfferParams] | undefined {
  const myAddress = session.getMyAddress();
  const theirAddress = session.getTheirAddress();
  if (myAddress && theirAddress) {
    const myOffer: TxBuilder.OfferParams = {
      address: myAddress,
      value: session.getMyValue(),
      utxos: session.getMyUtxos(),
    };

    const theirOffer: TxBuilder.OfferParams = {
      address: theirAddress,
      value: session.getTheirValue(),
      utxos: session.getTheirUtxos(),
    };
    return [myOffer, theirOffer];
  }
  return undefined;
}

function TheirSide(props: {
  isLocked: boolean;
  isTesting: boolean;
  address: Address | null;
  link: string;
  theirSelectedAssets: CardanoAsset.Asset[];
  networkID: NetworkID | null;
  commission: BigNum;
}) {
  const channelState = StoreZ.ChannelState.use((state) => state.channelState);
  if (channelState !== "Connected") {
    return <ThereIsNoOneHere link={props.link} />;
  } else {
    return (
      <TheirAssets
        isLocked={props.isLocked}
        isTesting={props.isTesting}
        address={props.address}
        theirSelectedAssets={props.theirSelectedAssets}
        networkID={props.networkID}
        commission={props.commission}
      />
    );
  }
}

function TheirAssets(props: {
  isLocked: boolean;
  isTesting: boolean;
  address: Address | null;
  theirSelectedAssets: CardanoAsset.Asset[];
  networkID: NetworkID | null;
  commission: BigNum;
}) {
  return (
    <VStack spacing={6} width={assetWidths}>
      <AssetListHeader
        isTesting={props.isTesting}
        address={props.address}
        text="You Will Receive"
        networkID={props.networkID}
        commission={props.commission}
      />
      {props.theirSelectedAssets.length === 0 ? (
        <AssetListEmptyState version="TheyWillSend" />
      ) : (
        <></>
      )}
      <AssetList
        isLocked={props.isLocked}
        isEditable={false}
        assets={props.theirSelectedAssets.map((asset) => {
          return { maxValue: asset.amount, ...asset };
        })}
        onAdaChange={() => {
          return;
        }}
        onAddNativeAsset={() => {
          return;
        }}
      ></AssetList>
    </VStack>
  );
}

function ThereIsNoOneHere(props: { link: string }) {
  return (
    <VStack spacing={6} width={assetWidths}>
      <VStack spacing={1}>
        <AssetListHeader
          text="Invite Someone To Trade"
          networkID={null}
          address={null}
          commission={Cardano.BigNum.zero()}
        />
        <Text textAlign={"center"} fontSize={["md", "lg"]}>
          Send the link to someone you want to trade with.
        </Text>
        <Copy label={"Link Copied!"} copy={props.link}>
          <ToolTip label={props.link}>
            <Button
              aria-label="Copy"
              colorScheme="primary"
              leftIcon={<Icons.ContentCopy />}
            >
              Copy Invite Link
            </Button>
          </ToolTip>
        </Copy>
      </VStack>
      <QRCode value={props.link} width={200} height={200}></QRCode>
      <VStack spacing={8}>
        <Text textAlign={"center"} fontSize={["lg", "xl"]}>
          Or
        </Text>

        <Link href={props.link} isExternal={true} _hover={{}}>
          <Button colorScheme={"secondary"}>TEST MODE</Button>
        </Link>
      </VStack>
    </VStack>
  );
}

function AssetListEmptyState(props: {
  version: "YouWillSend" | "TheyWillSend";
}) {
  let text = "You haven't added any assets!";
  let mood: KawaiiMood = "blissful";

  if (props.version === "TheyWillSend") {
    text = "They haven't added any assets!";
    mood = "shocked";
  }

  return (
    <VStack spacing={2}>
      <Ghost size={240} mood={mood} color={colors.default.characters.ghost} />
      <Text fontSize={14} fontWeight={"medium"}>
        {text}
      </Text>
    </VStack>
  );
}

function AddAsset(props: {
  assets: CardanoAsset.Asset[];
  onAddADA: () => void;
  onAddNativeAsset: (
    hash: ScriptHash,
    assetName: AssetName,
    amount: BigNum
  ) => void;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button onClick={onOpen} colorScheme="primary">
        ADD ASSET
      </Button>
      <AssetSelector
        isOpen={isOpen}
        onClose={onClose}
        assets={props.assets}
        addAsset={(asset: CardanoAsset.Asset) => {
          if (asset.kind === "ADA") {
            props.onAddADA();
          }

          if (asset.kind === "NativeAsset") {
            props.onAddNativeAsset(
              asset.metadata.hash,
              asset.metadata.assetName,
              Cardano.BigNum.from_str("1")
            );
          }
        }}
      />
    </>
  );
}

async function deriveTheirSelectedAssets(
  value: Value,
  networkID: NetworkID,
  lib: typeof CardanoSerializationLib
): Promise<CardanoAsset.Asset[]> {
  const theirAssets = CardanoAsset.findMetadata(networkID, value);
  const theirHydratedAssets = await CardanoAsset.hydrateMetadata(lib)(
    networkID,
    theirAssets
  );
  return theirHydratedAssets.filter((asset) => !asset.amount.is_zero());
}

async function deriveMySelectedAssets(
  totalValue: Value,
  value: Value,
  networkID: NetworkID,
  lib: typeof CardanoSerializationLib
): Promise<SelectedAsset[]> {
  const assets = await deriveTheirSelectedAssets(value, networkID, lib);
  return assets.map((asset) => {
    let maxValue = lib.BigNum.zero();
    if (asset.kind === "ADA") {
      maxValue = totalValue.coin();
    } else {
      maxValue = ValueExtra.lookup(lib)(
        asset.metadata.hash,
        asset.metadata.assetName,
        totalValue
      );
    }
    // val might be larger then max (the utxo set could have changed)
    const amount = BigNumExtra.clamp(asset.amount, lib.BigNum.zero(), maxValue);
    const newAsset = {
      maxValue: maxValue,
      ...asset,
    };

    newAsset.amount = amount;

    return newAsset;
  });
}

export default Session;
