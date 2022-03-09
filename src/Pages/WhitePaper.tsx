import {
  Container,
  Heading,
  VStack,
  Text,
  HStack,
  OrderedList,
  ListItem,
  Image,
} from "@chakra-ui/react";
import TextLink from "../components/TextLink";
import NamiDiffImg from "../assets/img/whitepaper/nami-diff.png";
import NamiReceiveImg from "../assets/img/whitepaper/nami-receive.png";
import NamiSendImg from "../assets/img/whitepaper/nami-send.png";

export default function WhitePaper() {
  return (
    <Container maxW="container.md" my={8}>
      <VStack spacing={4} width={"fill"} align="left">
        <VStack spacing={1}>
          <Heading textAlign="center" fontSize={["4xl", null, "5xl"]}>
            White Paper
          </Heading>
          <VStack spacing={0}>
            <Text>Frank Hampus Weslien</Text>
            <Text>February 4, 2022</Text>
          </VStack>
        </VStack>
        <Text fontStyle={"italic"}>
          Atomic Swap is a synchronous p2p trading app on Cardano. It allows two
          participants to trade any number of assets in one transaction without
          the need for smart contracts or escrow services. Instead it uses
          multisig transactions.
        </Text>
        <H2>Problem</H2>
        <VStack width={"fill"} align="left">
          <BreadText>
            Imagine a scenario where Bob wants to swap &quot;NFT B&quot; for
            Alice’s &quot;NFT A&quot;. However, Bob and Alice mutually distrust
            one another and neither wants to send their NFT first. Instead they
            take the help of Charlie whom they both trust. They both send their
            NFTs to Charlie who then, when he has received both, completes the
            swap by transferring the NFTs to the new owner. Usually Charlie
            takes some fee to perform this transaction and is something we would
            recognize as an escrow service.
          </BreadText>
          <BreadText>
            Notice that the need for escrow stems from neither Alice nor Bob
            wanting to send their NFT first. If we could send both NFTs at the
            same time, and ensure that either both NFTs exchange owners or
            neither, we could remove the need for Charlie.
          </BreadText>
          <BreadText>
            Atomic Swap is a dApp that allows two wallets to swap assets with
            zero counterparty risk.
          </BreadText>
        </VStack>
        <H2>Technical Background</H2>
        <BreadText>
          Cardano has a number features that will be combined to realise a
          trustless swap of assets between two wallets.
        </BreadText>
        <H3>UTxOs</H3>
        <BreadText>
          Unspent transaction output (UTxO) is a way to represent assets
          electronically [1]. Each UTxO can be seen as a digital equivalent of a
          coin. But since they are digital they work a bit differently from
          physical ones. They don’t have fixed amounts like coins in the real
          world, instead they can have any value such as 300, 1.23732, or 45
          million.
        </BreadText>
        <BreadText>
          If you want to use a UTxO you must spend the whole thing. If Bob has
          100 Ada in one UTxO and wants to send 10 Ada to Alice he must spend
          the entire 100 Ada, send 10 Ada to Alice and then send the remaining
          90 Ada back to himself (we are ignoring fees in this example). Notice
          that the outputs of a transaction must always sum to the same amount
          as the inputs of a transaction.
        </BreadText>

        <H3>Native Assets</H3>
        <BreadText>
          Cardano supports native assets without the need for smart contracts
          and like Ada they reside in UTxOs. They are identified by two parts,
          the policyID which is that hash of the script that defines the
          conditions under which the asset can be minted/burned. As well as the
          asset name which is an array of bytes that has the purpose of allowing
          the same script to define the rules for minting/burning multiple
          different assets. ADA is the asset which has the empty policyID and
          empty assetID.[2]
        </BreadText>
        <H3>Min Ada Amount</H3>
        <BreadText>
          Every UTxO on Cardano must have a minimum amount of ada. This is to
          prevent an attacker from creating useless UTxOs that take up space,
          harming the network. The min ada amount sets an upper bound on the
          maximum number of UTxOs that can exist since Ada is capped at 45
          billion [3]. The minimum ada amount is dependent on the size of the
          UTxO. The larger number of distinct native assets the larger the UTxO
          and hence the min ada requirement is higher [4].
        </BreadText>
        <H3>MultiSig</H3>
        <BreadText>
          Multi-signature (multisig) means that multiple keys must authorise a
          transaction by providing signatures [5]. The keys can be controlled by
          different wallets, and hence different people.
        </BreadText>
        <H2>Implementation</H2>
        <BreadText>
          This will be a high level description, and not include any code.
          However, if you understand the concepts it should be trivial to
          implement yourself.
        </BreadText>
        <BreadText>
          If we want to swap two NFTs between two wallets, what are the inputs
          and outputs of that transaction? Well, the inputs must be a set of
          UTxOs that contain the <Math>2 NFTs</Math>, can cover the network fee{" "}
          <Math>(~0.2 Ada)</Math>, the minimum ada amount{" "}
          <Math>(2 * ~1.3 Ada)</Math>, and the commission{" "}
          <Math>(2 * 1 Ada)</Math>. Bob would have to input a minimum value of
          roughly <Math>0.1 Ada + 1.3 Ada + 1 Ada + 1 NFT = 2.4 ADA + NFT</Math>
          . Paying for half the network fee, half the commission and the min ada
          amount for the NFT he is about to retrieve. There is a simliar
          calculation for Alice.
        </BreadText>
        <BreadText>
          It is very unlikely that the users have UTxOs that perfectly match
          what they have to input. Most likely the total value contained in the
          set of UTxOs they will use will be greater than what they actually
          need to pay. This excess value will be sent back to the original
          owner.
        </BreadText>
        <BreadText>
          This creates a bit of a chicken and the egg problem. The fee is based
          on the size of the transaction, which is dependent on the number of
          inputs and outputs. But the size of the transaction can not be known
          until we have added all inputs and outputs to the transaction, which
          depends on the fee. It can be solved by simply running the algorithm
          multiple times until it reaches a fixed point.
        </BreadText>
        <BreadText>
          To build a valid transaction the input value and output value must
          equal according to the formula <Math>input = output + fee</Math>. In
          our case:{" "}
          <Math>
            inputB + inputA == commissionB + commissionA + fee + changeB +
            changeA + receiveA + receiveB
          </Math>
        </BreadText>
        <H3>Alogrithm</H3>
        <BreadText>A rough outline of the alogrithm.</BreadText>
        <BreadText as="div">
          <OrderedList>
            <ListItem>Add UTxO for the 2 Ada commission</ListItem>
            <ListItem>Add UTxO containing what Bob will receive</ListItem>
            <ListItem>Add UTxO containing what Alice will receive</ListItem>
            <ListItem>Estimate the fee</ListItem>
            <ListItem>
              Add inputs to cover what Bob will be sending + fee/2 (*) +
              commission/2
            </ListItem>
            <ListItem>
              Add inputs to cover what Alice will be sending + fee/2 (*) +
              commission/2
            </ListItem>
            <ListItem>
              Add UTxO of the estimate for what Bob will receive in change
            </ListItem>
            <ListItem>
              Add UTxO of the estimate for what Alice will receive in change
            </ListItem>
            <ListItem>
              Does the equation inputBob + inputAlice = commission + fee +
              changeBob +changelice + receivelice + receiveBob hold? Great,
              you&apos;re done!
            </ListItem>
            <ListItem>
              If not and the reason is because we can not pay the network fee,
              go back to 4 and add more ada to the inputs. In any other case we
              can not build the transaction.
            </ListItem>
          </OrderedList>
        </BreadText>

        <BreadText>
          Of course there are more nuances like proper error messages,
          time-to-live, etc.
        </BreadText>
        <BreadText>
          (*) Atomic Swap have the users pay for half of the total transaction
          fee. One could have an algorithm that splits the fee based on the
          number of bytes each user contributes to the transaction. However, we
          did not consider that more &quot;fair&quot; then this approach.
        </BreadText>
        <H2>Proof</H2>
        <BreadText>
          You can play around with this app, creating transactions with yourself
          on the testnet/mainnet. There is a{" "}
          <TextLink
            isExternal
            href={"https://www.youtube.com/watch?v=XdE0aK5ypWM"}
          >
            “How To Video”
          </TextLink>{" "}
          if you need help.
        </BreadText>
        <BreadText>
          If you want stone cold proof you can check out this{" "}
          <TextLink
            isExternal
            href={
              "https://cardanoscan.io/address/016e97768d8ec17c93d97f12fe52256d43431deaebbb51e14cfb160fdd27540567add2c659e07e1066d29edb2b7a4d582692fdfe7061db8bee"
            }
          >
            address on cardanoscan
          </TextLink>
          . Every transaction you see at that link is a swap facilitated by
          Atomic Swap.
        </BreadText>
        <BreadText>
          If you want to be sure that the transaction you are about to sign
          doesn&apos;t have any funny business going on. You should scrutinize
          the transaction sign screen, and make sure that it displays what you
          are expecting. Nami wallet has an excellent one as seen in image (1).
        </BreadText>
        <VStack>
          <HStack width={"100%"}>
            <Image
              width={"33%"}
              objectFit="cover"
              alt="Nami Wallet sign transaction screen"
              src={NamiDiffImg}
            />
            <Image
              width={"33%"}
              objectFit="cover"
              alt="Nami Wallet receive screen"
              src={NamiReceiveImg}
            />
            <Image
              width={"33%"}
              objectFit="cover"
              alt="Nami Wallet send screen"
              src={NamiSendImg}
            />
          </HStack>
          <Text fontSize={14}>
            (1) Example of Nami Wallet&apos;s transaction sign screen.
          </Text>
        </VStack>

        <H2>Conclusions</H2>
        <BreadText>
          Atomic Swap allows for bartering between people in real time. It
          sacrifices being asynchronous and instead aims to be simpler, and
          cheaper. It supports arbitrarily complex trades and is a good fit for
          trading low liquidity assets such as NFTs.
        </BreadText>
        <H2>References</H2>
        <VStack align={"left"}>
          <Reference
            number={1}
            href="https://en.wikipedia.org/wiki/Unspent_transaction_output"
          >
            Wikipedia. Unspent transaction output. Feb 8, 2022.
          </Reference>
          <Reference
            number={2}
            href="https://docs.cardano.org/native-tokens/learn"
          >
            Input Output. Learn about native tokens. Feb 8, 2022.
          </Reference>
          <Reference
            number={3}
            href="https://github.com/input-output-hk/cardano-ledger/blob/master/doc/explanations/min-utxo-mary.rst"
          >
            Input Output. Min-Ada-Value Requirement. Sep 16, 2021.
          </Reference>
          <Reference
            number={4}
            href="https://github.com/input-output-hk/cardano-ledger/blob/master/doc/explanations/min-utxo-alonzo.rst"
          >
            Input Output. Min-Ada-Value Calculation in Alonzo. Sep 16, 2021.
          </Reference>
          <Reference
            number={5}
            href="https://en.bitcoin.it/wiki/Multi-signature"
          >
            Bitcoin Wiki. Multi-signature. Jul 20, 2021.
          </Reference>
        </VStack>
      </VStack>
    </Container>
  );
}

function Math(props: {
  children: (string | JSX.Element)[] | string | JSX.Element;
}) {
  return (
    <Text
      bgColor={"accentDarkMode.500"}
      color="white"
      p={0.5}
      rounded={2}
      as="span"
    >
      {props.children}
    </Text>
  );
}

function H2(props: { children: string | JSX.Element }) {
  return <Heading fontSize={["3xl", null, "4xl"]}>{props.children}</Heading>;
}

function H3(props: { children: string | JSX.Element }) {
  return <Heading fontSize={["2xl", null, "3xl"]}>{props.children}</Heading>;
}

function BreadText(props: {
  children: (string | JSX.Element)[] | (string | JSX.Element);
  as?: any;
}) {
  return <Text as={props.as}>{props.children}</Text>;
}

function Reference(props: {
  number: number;
  href: string;
  children: string | JSX.Element;
}) {
  return (
    <HStack>
      <Text>[{props.number}]</Text>
      <TextLink isExternal href={props.href}>
        {props.children}
      </TextLink>
    </HStack>
  );
}
