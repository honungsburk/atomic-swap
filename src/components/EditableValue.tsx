import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Box,
  VStack,
  Center,
  Button,
  FormErrorMessage,
  FormControl,
  useDisclosure,
  useColorModeValue,
} from "@chakra-ui/react";

import { SliderInput } from "./SliderInput";
import { BigNum } from "@emurgo/cardano-serialization-lib-browser";
import { Field, Form, Formik } from "formik";
import ToolTip from "./ToolTip";

function EditableValue(props: {
  maxValue: BigNum;
  value: BigNum;
  decimals: number;
  symbol: JSX.Element | string;
  header: JSX.Element | string;
  onValueSubmit: (value: BigNum) => void;
  children: JSX.Element | ((isOpen: boolean) => JSX.Element);
}) {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const zero = BigNum.zero();
  const initForm = { amount: props.value };

  const colorMode = useColorModeValue(
    {
      color: "black",
      bgColor: "accentDarkMode.700",
    },
    {
      color: "white",
      bgColor: "accentDarkMode.700",
    }
  );

  return (
    <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
      <PopoverTrigger>
        <Box cursor="pointer">
          <ToolTip label="Click To Edit">
            {typeof props.children === "function"
              ? props.children(isOpen)
              : props.children}
          </ToolTip>
        </Box>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton color={colorMode.color} />
        <PopoverHeader color={colorMode.color}>{props.header}</PopoverHeader>
        <PopoverBody>
          <Formik
            initialValues={initForm}
            validate={(values) => {
              const errors: any = {};
              if (zero.compare(values.amount) > 0) {
                errors.amount = "MUST BE 0 OR LARGER";
              }

              if (values.amount.compare(props.maxValue) > 0) {
                errors.amount = "AMOUNT EXCEEDS WHAT YOU HAVE IN YOUR WALLET";
              }

              return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
              setSubmitting(true);
              props.onValueSubmit(values.amount);
              setSubmitting(false);
            }}
          >
            {(formikProps) => (
              <Form>
                <VStack>
                  <Field name="amount">
                    {({ field, form }: any) => {
                      return (
                        <FormControl>
                          <SliderInput
                            {...field}
                            setFieldValue={(n: BigNum) =>
                              form.setFieldValue(field.name, n)
                            }
                            id="amount"
                            maxValue={props.maxValue}
                            decimals={props.decimals}
                            symbol={props.symbol}
                          />
                          <FormErrorMessage>{form.errors.ada}</FormErrorMessage>
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
                      UPDATE
                    </Button>
                  </Center>
                </VStack>
              </Form>
            )}
          </Formik>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

export default EditableValue;
