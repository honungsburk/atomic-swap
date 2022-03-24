import {
  Text,
  VStack,
  HStack,
  Button,
  Input,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Center,
  FormControl,
  RadioGroup,
  Radio,
  FormErrorMessage,
  FormLabel,
  Flex,
  Spacer,
  useBreakpointValue,
} from "@chakra-ui/react";
import * as Icons from "../../components/Icons";
import { DialogBox } from "../../components/DialogBox";
import React from "react";
import AssetIdentifier from "./AssetIdentifier";
import { Field, Form, Formik } from "formik";
import * as CardanoUtil from "../../Cardano/Util";
import { useLiveQuery } from "dexie-react-hooks";
import { db, IAssetIdentifierData } from "../../Storage/DB";
import SelectGroup from "../../components/SelectGroup";
import { Ghost } from "../../components/ChakraKawaii";
import colors from "../../Theme/colors";
import { Layout } from "./Layout";
import { NetworkID } from "cardano-web-bridge-wrapper";

export default function AssetVerification(): JSX.Element {
  const layout: "vertical" | "horizontal" | undefined = useBreakpointValue({
    base: "vertical",
    sm: "horizontal",
  });

  const [search, setSearch] = React.useState("");
  const [listFilter, setListFilter] = React.useState<
    undefined | "Whitelist" | "Blacklist"
  >(undefined);
  const [networkIDFilter, setNetworkIDFilter] = React.useState<
    undefined | NetworkID
  >(undefined);

  const allAssetIdentifiers = useLiveQuery(() => {
    const query: { [key: string]: string } = {};
    if (listFilter) {
      query.list = listFilter;
    }

    if (networkIDFilter) {
      query.networkID = networkIDFilter;
    }

    if (Object.keys(query).length > 0) {
      return db.assetIdentifiers
        .where(query)
        .filter((identifier) =>
          identifier.name.toLowerCase().includes(search.toLowerCase())
        )
        .toArray();
    } else {
      return db.assetIdentifiers
        .filter((identifier) =>
          identifier.name.toLowerCase().includes(search.toLowerCase())
        )
        .toArray();
    }
  }, [listFilter, networkIDFilter, search]);

  const assetIdentifiers = allAssetIdentifiers;

  return (
    <Layout header="Asset Verification" hasBackButton isBeta={true}>
      <VStack spacing={10}>
        <DialogBox icon={<Icons.Info />} headerText="Info">
          <Text>
            During the beta all policyIDs/assetIDs will only be stored locally.
          </Text>
        </DialogBox>
        <VStack spacing={6} width={"100%"}>
          <VStack width={"100%"}>
            <HStack width={"100%"}>
              <Input
                width={"100%"}
                value={search}
                size="lg"
                placeholder="Search..."
                fontSize="lg"
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              ></Input>
              <AddAssetIdentifier
                onAddAsset={(assetIdentifier) => {
                  db.assetIdentifiers.put(assetIdentifier);
                }}
              />
            </HStack>
            <Flex width={"100%"} alignItems="space-between">
              <SelectGroup
                selectedOption={listFilter}
                options={[
                  { option: "Whitelist", value: "Whitelist" },
                  { option: "Blacklist", value: "Blacklist" },
                ]}
                onClick={setListFilter}
              />
              <Spacer />
              <SelectGroup
                selectedOption={networkIDFilter}
                options={[
                  { option: "Mainnet", value: "Mainnet" },
                  { option: "Testnet", value: "Testnet" },
                ]}
                onClick={setNetworkIDFilter}
              />
            </Flex>
          </VStack>
          <VStack>
            {assetIdentifiers !== undefined && assetIdentifiers.length > 0 ? (
              assetIdentifiers.map((d) => (
                <AssetIdentifier
                  size={layout === "vertical" ? "compressed" : "full"}
                  key={d.id}
                  assetIdentifier={d}
                  onDelete={() =>
                    d.id ? db.assetIdentifiers.delete(d.id) : {}
                  }
                />
              ))
            ) : (
              <VStack>
                <Ghost
                  size={240}
                  mood="sad"
                  color={colors.characters.ghost}
                ></Ghost>
                <Text>I couldn&apos;t find any identifiers!</Text>
              </VStack>
            )}
          </VStack>
        </VStack>
      </VStack>
    </Layout>
  );
}

function AddAssetIdentifier(props: {
  onAddAsset: (asset: IAssetIdentifierData) => void;
}): JSX.Element {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initalData: IAssetIdentifierData = {
    name: "",
    networkID: "Mainnet",
    identifier: "",
    list: "Whitelist",
  };

  return (
    <>
      <Button colorScheme={"primary"} onClick={onOpen}>
        ADD
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add policyID/assetID</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Formik
              initialValues={initalData}
              onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                props.onAddAsset(values);
                setSubmitting(false);
              }}
              validate={async (values) => {
                const errors: any = {};
                if (values.name.length === 0) {
                  errors.name = "NAME CAN NOT BE LEFT EMPTY";
                }

                if (
                  CardanoUtil.assetIdentifierType(values.identifier) ===
                  "unknown"
                ) {
                  errors.identifier = "NOT A VALID policyID OR assetID";
                } else {
                  await db.assetIdentifiers
                    .get({ identifier: values.identifier })
                    .then((c) => {
                      if (c !== undefined) {
                        errors.identifier = "ALREADY BEEN ADDED";
                      }
                    })
                    .catch(() => undefined);
                }

                if (
                  values.networkID !== "Mainnet" &&
                  values.networkID !== "Testnet"
                ) {
                  errors.networkID = "MUST BE EITHER 'Mainnet' OR 'Testnet'";
                }

                if (
                  values.list !== "Blacklist" &&
                  values.list !== "Whitelist"
                ) {
                  errors.list = "MUST BE EITHER 'Blacklist' OR 'Whitelist'";
                }

                return errors;
              }}
            >
              {(formikProps) => (
                <Form>
                  <VStack>
                    <Field name="networkID">
                      {({ field, form }: any) => {
                        return (
                          <FormControl
                            isRequired
                            isInvalid={
                              form.errors.networkID && form.touched.networkID
                            }
                          >
                            <FormLabel htmlFor="networkID">Network</FormLabel>
                            <RadioGroup {...field} id="networkID">
                              <HStack spacing={2}>
                                <Radio
                                  {...field}
                                  colorScheme="primary"
                                  value="Mainnet"
                                >
                                  Mainnet
                                </Radio>
                                <Radio
                                  {...field}
                                  colorScheme="primary"
                                  value="Testnet"
                                >
                                  Testnet
                                </Radio>
                              </HStack>
                            </RadioGroup>
                            <FormErrorMessage>
                              {form.errors.networkID}
                            </FormErrorMessage>
                          </FormControl>
                        );
                      }}
                    </Field>
                    <Field name="list">
                      {({ field, form }: any) => {
                        return (
                          <FormControl
                            isRequired
                            isInvalid={form.errors.list && form.touched.list}
                          >
                            <FormLabel htmlFor="networkID">List</FormLabel>
                            <RadioGroup {...field} id="list">
                              <HStack spacing={2}>
                                <Radio
                                  {...field}
                                  colorScheme="primary"
                                  value="Whitelist"
                                >
                                  Whitelist
                                </Radio>
                                <Radio
                                  {...field}
                                  colorScheme="primary"
                                  value="Blacklist"
                                >
                                  Blacklist
                                </Radio>
                              </HStack>
                            </RadioGroup>
                            <FormErrorMessage>
                              {form.errors.list}
                            </FormErrorMessage>
                          </FormControl>
                        );
                      }}
                    </Field>
                    <Field name="name">
                      {({ field, form }: any) => {
                        return (
                          <FormControl
                            isRequired
                            isInvalid={form.errors.name && form.touched.name}
                          >
                            <FormLabel htmlFor="name">Name</FormLabel>
                            <Input
                              {...field}
                              id="name"
                              variant="filled"
                              placeholder="Name"
                            />
                            <FormErrorMessage>
                              {form.errors.name}
                            </FormErrorMessage>
                          </FormControl>
                        );
                      }}
                    </Field>
                    <Field name="identifier">
                      {({ field, form }: any) => {
                        return (
                          <FormControl
                            isRequired
                            isInvalid={
                              form.errors.identifier && form.touched.identifier
                            }
                          >
                            <FormLabel htmlFor="identifier">
                              policyID/assetID
                            </FormLabel>
                            <Input
                              {...field}
                              id="identifier"
                              variant="filled"
                              placeholder="policyID, assetID"
                            />
                            <FormErrorMessage>
                              {form.errors.identifier}
                            </FormErrorMessage>
                          </FormControl>
                        );
                      }}
                    </Field>
                    <Center>
                      <Button
                        mt={4}
                        colorScheme="primary"
                        isDisabled={!(formikProps.isValid && formikProps.dirty)}
                        isLoading={formikProps.isSubmitting}
                        onClick={onClose}
                        type="submit"
                      >
                        ADD
                      </Button>
                    </Center>
                  </VStack>
                </Form>
              )}
            </Formik>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
