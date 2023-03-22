"use client";

import { Button, Flex, Text } from "@chakra-ui/react";
import { FC, useCallback, useEffect, useState } from "react";
import HeadingLine from "../components/HeadingLine";
import SearchResults from "../components/SearchResults";
import { Releases as TReleases } from "../types";
import getReleases, { LIMIT } from "./getReleases";

const Releases: FC<{ initial: TReleases; tags: Array<string> }> = ({
  initial = [],
  tags,
}) => {
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(initial.length);
  const [showLoadMore, setShowLoadMore] = useState(initial.length === LIMIT);

  const [releases, setReleases] = useState<TReleases>(initial);

  const loadMore = useCallback(async () => {
    setLoading(true);
    const results = await getReleases({
      tags,
      offset,
    });

    if (results.length < LIMIT) {
      setShowLoadMore(false);
    }

    setReleases((currentReleases) => [...currentReleases, ...results]);
    setLoading(false);
    setOffset((currentOffset) => currentOffset + LIMIT);
  }, [offset, setLoading, tags]);

  useEffect(() => {
    setReleases(initial);
  }, [initial]);

  return (
    <Flex
      as="section"
      width="100%"
      textAlign="center"
      alignItems="center"
      flexDirection="column"
    >
      <HeadingLine
        title={["Releases"]
          .concat(tags.length ? ["tagged", tags.join(", ")] : [])
          .join(" ")}
      />
      {releases.length ? (
        <SearchResults loading={loading} results={releases} />
      ) : (
        <Text
          fontFamily={`'Roboto Condensed',sans-serif`}
          fontWeight={700}
          paddingTop="3rem"
        >
          Sorry, we could not find anything
        </Text>
      )}
      {showLoadMore && (
        <Button
          marginY={16}
          paddingX={12}
          paddingY={6}
          fontSize="1.125rem"
          onClick={loadMore}
        >
          load more
        </Button>
      )}
    </Flex>
  );
};

export default Releases;
