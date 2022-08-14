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
import * as CardanoSerializationLibOld from "cardano-serialization-lib-browser-old";
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
import Store from "../Storage/Store";
import LockAndSign from "./Session/LockAndSign";
import { SelectedAsset } from "./Session/Types";
import AssetList from "./Session/AssetList";
import { KawaiiMood } from "react-kawaii";
import OfferReponsePrompt from "./Session/OfferResponsePrompt";
import AcceptOfferPrompt from "./Session/AcceptOfferPrompt";
import AssetListHeader from "./Session/AssetListHeader";
import { ChannelState } from "../Network/Channel";
import QRCode from "../components/QRCode";
import WalletConnectButton from "../components/WalletConnectButton";
import * as colors from "../Theme/colors";
import Copy from "../components/Copy";
import ToolTip from "../components/ToolTip";
import * as Icons from "../components/Icons";
import { DialogBox } from "../components/DialogBox";

function Session(props: {
  onWalletChange: (wallet: BasicWallet) => void;
  channelState: ChannelState;
  wallet?: BasicWallet;
  session: NetworkSession.Session;
  store: Store;
  lib: typeof CardanoSerializationLib;
}) {
  const layout: "vertical" | "horizontal" | undefined = useBreakpointValue({
    base: "vertical",
    lg: "horizontal",
  });
  const navigate = useNavigate();
  const toast = useToast();
  const commission = props.lib.BigNum.from_str("1000000");

  ////////////////////////////////////////////////////////////////////////////////
  // Available Value
  ////////////////////////////////////////////////////////////////////////////////

  const [availableValue, setAvailableValue] = React.useState<{
    val: Value;
    networkID: NetworkID;
  }>({ val: props.lib.Value.zero(), networkID: "Mainnet" });
  React.useEffect(() => {
    const update = async () => {
      if (props.wallet !== undefined) {
        const balance = await props.wallet.getBalance();
        const networkID = await props.wallet.getNetworkId();
        setAvailableValue({ val: balance, networkID: networkID });
      }
    };
    update();
  }, [props.wallet]);

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
    setMyNetworkID(props.session.getMyNetworkID());
    return props.session.onMyNetworkID(setMyNetworkID);
  }, [props.session]);

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
          props.lib
        );
        setMySelectedAssets(assets);
      };
      exec(props.session.getMyValue());
      return props.session.onMyValue(exec);
    }
  }, [props.session, myNetworkID, availableValue, props.lib]);

  const selectedAssetsUnits: Set<string> = new Set();
  mySelectedAssets.forEach((asset) =>
    selectedAssetsUnits.add(CardanoAsset.makeID(asset))
  );

  // Lock

  const [myLock, setMyLock] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (props.session !== undefined) {
      setMyLock(props.session.getMyLock());
      return props.session.onMyLock(setMyLock);
    }
  }, [props.session]);

  // Address

  const [myAddress, setMyAddress] = React.useState<Address | null>(null);

  React.useEffect(() => {
    setMyAddress(props.session.getMyAddress());
    return props.session.onMyAddress((addr) => {
      setMyAddress(addr);
    });
  }, [props.session]);

  /////////////// Their State

  // NetworkID

  const [theirNetworkID, setTheirNetworkID] = React.useState<NetworkID | null>(
    null
  );

  React.useEffect(() => {
    setTheirNetworkID(props.session.getTheirNetworkID());
    return props.session.onTheirNetworkID(setTheirNetworkID);
  }, [props.session]);

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
          props.lib
        );
        setTheirSelectedAssets(assets);
      };
      exec(props.session.getTheirValue());
      return props.session.onTheirValue(exec);
    }
  }, [props.session, theirNetworkID, props.lib]);

  // Lock

  const [theirLock, setTheirLock] = React.useState<boolean>(false);

  React.useEffect(() => {
    setTheirLock(props.session.getTheirLock());
    return props.session.onTheirLock(setTheirLock);
  }, [props.session]);

  // Address

  const [theirAddress, setTheirAddress] = React.useState<Address | null>(null);

  React.useEffect(() => {
    setTheirAddress(props.session.getTheirAddress());
    return props.session.onTheirAddress(setTheirAddress);
  }, [props.session]);

  ////////////////////////////////////////////////////////////////////////////////
  // Offer
  ////////////////////////////////////////////////////////////////////////////////

  const [offer, setOffer] = React.useState<NetworkSession.Offer | undefined>(
    undefined
  );

  React.useEffect(() => {
    if (props.session !== undefined) {
      const session = props.session;
      setOffer(props.session.getOffer());
      return props.session.onOffer((offer) => {
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
          if (props.store !== undefined && myNetworkID !== null) {
            props.store.setPendingTx(
              offer.txID,
              session.getNegotiatedTTL(),
              myNetworkID
            );
          }
        }
      });
    }
  }, [props.session, props.store, myNetworkID]);

  ////////////////////////////////////////////////////////////////////////////////
  // MissMatch!
  ////////////////////////////////////////////////////////////////////////////////

  // Check if there is conflict between our state and what they think our state is
  const [myTradeMatchTheirs, setMyTradeMatchTheirs] = React.useState<
    undefined | NetworkSession.TradeMissMatch
  >(undefined);

  React.useEffect(() => {
    const errors: NetworkSession.TradeMissMatch[] =
      props.session.getMissMatchErrors();
    if (errors.length > 0) {
      setMyTradeMatchTheirs(errors[0]);
    } else {
      setMyTradeMatchTheirs(undefined);
    }
    return props.session.onMissMatchErrors(
      (errors: NetworkSession.TradeMissMatch[]) => {
        if (errors.length > 0) {
          setMyTradeMatchTheirs(errors[0]);
        } else {
          setMyTradeMatchTheirs(undefined);
        }
      }
    );
  }, [props.session]);

  const getUrl = window.location;

  const layoutProps: LayoutProps = {
    isTesting:
      myAddress !== null &&
      myAddress?.to_bech32("addr") === theirAddress?.to_bech32("addr"),
    myAddress: myAddress,
    theirAddress: theirAddress,
    onWalletChange: props.onWalletChange,
    hasWallet: props.wallet !== undefined,
    channelState: props.channelState,
    link: `${getUrl.protocol}//${getUrl.host}/session/${props.session.getID()}`,
    wallet: props.wallet,
    myNetworkID: myNetworkID,
    iAmLocked: myLock,
    theirLock: theirLock,
    commission: commission,
    onAdaChange: (ada) => {
      props.session.updateMyADA(ada);
    },
    availableAssets: availableAssets.filter(
      (asset) => !selectedAssetsUnits.has(CardanoAsset.makeID(asset))
    ),
    mySelectedAssets: mySelectedAssets,
    updateNativeAsset: (hash, assetName, amount) => {
      props.session.addMyAsset(hash, assetName, amount);
    },
    tradeMissMatch: myLock ? myTradeMatchTheirs : undefined,
    offer: offer,
    session: props.session,
    theirNetworkID: theirNetworkID,
    theirSelectedAssets: theirSelectedAssets,
    lib: props.lib,
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
  onWalletChange: (wallet: BasicWallet) => void;
  link: string;
  channelState: ChannelState;
  wallet?: BasicWallet;
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
  session: NetworkSession.Session;

  theirNetworkID: NetworkID | null;
  theirSelectedAssets: CardanoAsset.Asset[];

  lib: typeof CardanoSerializationLib;
};

function HorizontalLayout(props: LayoutProps) {
  return (
    <Flex my={6}>
      <Spacer />
      <MySide
        lib={props.lib}
        isTesting={props.isTesting}
        address={props.myAddress}
        hasWallet={props.hasWallet}
        onWalletChange={props.onWalletChange}
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
          lib={props.lib}
          numberOfAssets={
            props.mySelectedAssets.length + props.theirSelectedAssets.length
          }
          isTesting={props.isTesting}
          wallet={props.wallet}
          myLock={props.iAmLocked}
          theirLock={props.theirLock}
          session={props.session}
          offer={props.offer}
          missMatchError={props.tradeMissMatch}
        />
      </VStack>
      <Spacer />
      <TheirSide
        lib={props.lib}
        isLocked={props.iAmLocked}
        isTesting={props.isTesting}
        address={props.theirAddress}
        link={props.link}
        channelState={props.channelState}
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
        lib={props.lib}
        isTesting={props.isTesting}
        address={props.myAddress}
        hasWallet={props.hasWallet}
        onWalletChange={props.onWalletChange}
        networkID={props.myNetworkID}
        isLocked={props.iAmLocked}
        commission={props.commission}
        onAdaChange={props.onAdaChange}
        availableAssets={props.availableAssets}
        selectedAssets={props.mySelectedAssets}
        addNativeAsset={props.updateNativeAsset}
      />
      <TheirSide
        lib={props.lib}
        isLocked={props.iAmLocked}
        isTesting={props.isTesting}
        address={props.theirAddress}
        channelState={props.channelState}
        link={props.link}
        networkID={props.theirNetworkID}
        commission={props.commission}
        theirSelectedAssets={props.theirSelectedAssets}
      />
      <VStack>
        <Heading>Lock & Sign</Heading>
        <SessionController
          lib={props.lib}
          numberOfAssets={
            props.mySelectedAssets.length + props.theirSelectedAssets.length
          }
          isTesting={props.isTesting}
          wallet={props.wallet}
          session={props.session}
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
      title: err.stringCode(),
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
  hasWallet: boolean;
  onWalletChange: (wallet: BasicWallet) => void;
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
  lib: typeof CardanoSerializationLib;
}) {
  if (props.hasWallet) {
    return (
      <MyAssets
        lib={props.lib}
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
    return (
      <ConnectWallet onWalletChange={props.onWalletChange} lib={props.lib} />
    );
  }
}

function ConnectWallet(props: {
  onWalletChange: (wallet: BasicWallet) => void;
  lib: typeof CardanoSerializationLib;
}) {
  return (
    <VStack spacing={6} width={assetWidths}>
      <AssetListHeader
        address={null}
        text="Connect Your Wallet"
        networkID={null}
        commission={props.lib.BigNum.zero()}
      />
      <CreditCard size={200} color={colors.default.characters.creditcard} />
      <WalletConnectButton
        onWalletChange={props.onWalletChange}
        lib={props.lib}
      />
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
  lib: typeof CardanoSerializationLib;
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
          lib={props.lib}
          assets={props.availableAssets}
          onAddADA={() =>
            props.onAdaChange(props.lib.BigNum.from_str("1000000"))
          }
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
  wallet?: BasicWallet;
  offer: NetworkSession.Offer | undefined;
  myLock: boolean;
  theirLock: boolean;
  session: NetworkSession.Session;
  missMatchError: NetworkSession.TradeMissMatch | undefined;
  lib: typeof CardanoSerializationLib;
}) {
  const toast = useToast();
  let component = <></>;

  if (props.wallet === undefined) {
    component = <></>;
  } else if (props.numberOfAssets <= 0) {
    component = (
      <DialogBox icon={<Icons.Info />} headerText="Info">
        Waiting for assets to be added
      </DialogBox>
    );
  } else if (props.offer === undefined) {
    const wallet = props.wallet;
    component = (
      <LockAndSign
        isMatching={props.missMatchError === undefined && !props.isTesting}
        isLocked={props.myLock}
        theyAreLocked={props.theirLock}
        onLock={() => props.session.updateMyLock(true)}
        onUnlock={() => props.session.updateMyLock(false)}
        onSign={async () => {
          const offer = buildOffer(props.session);
          if (offer !== undefined) {
            try {
              const witnessSet = await TxBuilder.signTx(
                props.lib,
                CardanoSerializationLibOld
              )(wallet, offer[0], offer[1], props.session.getNegotiatedTTL());
              props.session.createOffer(witnessSet);
            } catch (err: any) {
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
    const wallet = props.wallet;
    component = (
      <AcceptOfferPrompt
        onReject={() => props.session.rejectOffer()}
        onSign={async () => {
          const offer = buildOffer(props.session);
          if (offer !== undefined) {
            try {
              const txID = await TxBuilder.makeTx(
                props.lib,
                CardanoSerializationLibOld
              )(
                wallet,
                offer[0],
                offer[1],
                witness,
                props.session.getNegotiatedTTL()
              );
              props.session.acceptOffer(txID);
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
        onReset={() => props.session.resetOffer()}
      ></OfferReponsePrompt>
    );
  } else if (props.offer.kind === "OfferReject") {
    component = (
      <OfferReponsePrompt
        reponse={"Rejected"}
        onReset={() => props.session.resetOffer()}
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
      {props.missMatchError &&
      props.session.getChannelState() === "Connected" ? (
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
  channelState: ChannelState;
  link: string;
  theirSelectedAssets: CardanoAsset.Asset[];
  networkID: NetworkID | null;
  commission: BigNum;
  lib: typeof CardanoSerializationLib;
}) {
  if (props.channelState !== "Connected") {
    return <ThereIsNoOneHere link={props.link} lib={props.lib} />;
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

function ThereIsNoOneHere(props: {
  link: string;
  lib: typeof CardanoSerializationLib;
}) {
  return (
    <VStack spacing={6} width={assetWidths}>
      <VStack spacing={1}>
        <AssetListHeader
          text="Invite Someone To Trade"
          networkID={null}
          address={null}
          commission={props.lib.BigNum.zero()}
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
  lib: typeof CardanoSerializationLib;
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
              props.lib.BigNum.from_str("1")
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
