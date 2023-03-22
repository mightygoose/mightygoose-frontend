import { Box, Flex, Grid, GridItem, Image, Text } from "@chakra-ui/react";
import { FC, ReactNode } from "react";

const Tag: FC<{ children?: ReactNode; [key: string]: any }> = ({
  children,
  ...props
}) => (
  <Text
    as="span"
    padding="0.25rem 0.5rem"
    fontFamily={`'Roboto', sans-serif`}
    backgroundColor="white.200 !important"
    borderRadius="2px"
    color="grey.400"
    fontSize="0.625rem"
    {...props}
  >
    {children}
  </Text>
);

export default Tag;
