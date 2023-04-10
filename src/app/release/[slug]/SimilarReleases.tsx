"use client";

import { Flex, useTheme } from "@chakra-ui/react";
import { FC } from "react";
import HeadingLine from "../../components/HeadingLine";
import SearchResults from "../../components/SearchResults";
import { Releases as TReleases } from "../../types";

const SimilarReleases: FC<{ releases: TReleases }> = ({ releases }) => {
  const theme = useTheme();

  return (
    <Flex
      as="section"
      width="100%"
      textAlign="center"
      alignItems="center"
      flexDirection="column"
      paddingY="2rem"
    >
      <SearchResults
        loading={false}
        results={releases}
        title="similar releases"
      />
    </Flex>
  );
};

export default SimilarReleases;
