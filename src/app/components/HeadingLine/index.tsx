import { Box, Flex } from "@chakra-ui/react";
import { FC } from "react";

const HeadingLine: FC<{ title: string }> = ({ title }) => (
  <Flex
    width="100%"
    justifyContent="center"
    alignItems="center"
    textAlign="left"
    backgroundColor="grey.100"
    height="3.6rem"
  >
    <Box
      width="80%"
      maxWidth="800px"
      fontFamily="'Roboto Condensed', sans-serif"
      fontWeight={700}
      textTransform="uppercase"
      fontSize="1rem"
      color="grey.200"
    >
      <h1>{title}</h1>
    </Box>
  </Flex>
);

export default HeadingLine;
