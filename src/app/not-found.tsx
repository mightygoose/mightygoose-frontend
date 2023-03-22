"use client";

import { Text, Flex } from "@chakra-ui/react";

export default function NotFound() {
  return (
    <Flex
      flexDirection="column"
      width="80%"
      maxWidth="800px"
      gap="3rem"
      textAlign="center"
      paddingTop="7rem"
    >
      <Text
        textTransform="uppercase"
        fontFamily="'Roboto Condensed', sans-serif"
        fontWeight={700}
        fontSize="1.1rem"
        lineHeight="2rem"
      >
        {`We're sorry, but the page you're looking for can't be found. You may
        have mistyped the URL or the page may have been removed.`}
      </Text>

      <Text fontFamily={`'Roboto', sans-serif`} color="grey.400">
        {`Don't worry, though! You can still find the best music content from
        around the web on our website. Head to our homepage to get started. We
        are sure you will find something you love!`}
      </Text>
    </Flex>
  );
}
