"use client";

import Link from "next/link";
import { FC, useState, useEffect, useCallback, ChangeEvent } from "react";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Input,
  Text,
  Image,
  Badge,
} from "@chakra-ui/react";
import Autocomplete from "react-autocomplete";
import { useDebounce } from "usehooks-ts";
import styled from "@emotion/styled";
import fetch from "../../../lib/fetch";
import { AutocompleteResponse, AutocompleteItem } from "../../types";

const MIN_SYMBOLS = 3;

interface ResultReleaseItem extends AutocompleteItem {
  type: "item";
  uri: string;
}

interface ResultTagItem extends AutocompleteItem {
  type: "tag";
  title: string;
  count: number;
  id: number;
  uri: string;
}

type ResultItem = ResultReleaseItem | ResultTagItem;

type ResultItems = Array<ResultItem>;

const SearchBar: FC = () => {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<string>("");
  const [results, setResults] = useState<ResultItems>([]);
  const debouncedValue = useDebounce<string>(value, 500);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  useEffect(() => {
    if (!debouncedValue || debouncedValue.length < MIN_SYMBOLS) {
      return;
    }
    setLoading(true);
    (async () => {
      const response = await fetch<AutocompleteResponse>(
        `/api/search/autocomplete?q=` + debouncedValue
      );
      setResults([
        {
          id: 0,
          type: "tag",
          title: debouncedValue,
          uri: `/releases?tag=${debouncedValue}`,
          count: response.tags_count,
        },
        ...response.items
          .filter(
            (value, index, self) =>
              index === self.findIndex((t) => t.title === value.title)
          )
          .map<ResultReleaseItem>((item) => ({
            ...item,
            type: "item",
            title: item.title.replace(
              new RegExp(`(${debouncedValue})`, "gi"),
              "<strong>$&</strong>"
            ),
            uri: `/release/${item.id}`,
          })),
      ]);
      setLoading(false);
    })();
  }, [debouncedValue]);

  return (
    <Box
      as={Autocomplete}
      width="100%"
      alignItems="center"
      wrapperStyle={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
      value={value}
      onChange={handleChange}
      inputProps={{}}
      getItemValue={(item: ResultItem) => item.title}
      items={results}
      isItemSelectable={() => false}
      shouldItemRender={(item: ResultItem) =>
        !(item.type === "tag" && item.count === 0)
      }
      renderItem={(item: ResultItem, isHighlighted: boolean) => {
        return (
          <Box
            as={Link}
            href={item.uri}
            key={item.id}
            minHeight="2rem"
            maxHeight="2rem"
            alignItems="center"
            display="flex"
            gap="0.4rem"
            paddingX="1rem"
            _hover={{
              backgroundColor: "yellow.100",
            }}
          >
            {item.type === "tag" ? (
              <>
                releases tagged <strong>{item.title}</strong> ({item.count})
              </>
            ) : (
              <Flex
                height="2rem"
                gap="0.5rem"
                alignItems="center"
                overflow="hidden"
              >
                <Text
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  dangerouslySetInnerHTML={{ __html: item.title }}
                ></Text>
              </Flex>
            )}
          </Box>
        );
      }}
      renderInput={(props: any) => (
        <Input
          {...props}
          width="100%"
          border="none"
          color="white.100"
          backgroundColor="#222"
          placeholder="search..."
          borderRadius={2}
          _focus={{
            backgroundColor: "white.100",
            color: "black",
            boxShadow: "none",
          }}
        />
      )}
      renderMenu={(items: any, value?: string) => (
        <Flex
          flexDirection="column"
          boxShadow="rgba(0, 0, 0, 0.1) 0px 2px 12px"
          backgroundColor="white.100"
          position="absolute"
          overflow="auto"
          width="100%"
          maxHeight="80vh"
          zIndex={2}
        >
          {(value?.length || 0) < 3 ? null : loading ? (
            <Text as="span" paddingX="1rem">
              Loading...
            </Text>
          ) : items.length === 0 ? (
            <Text as="span" paddingX="1rem">
              No matches for {value}
            </Text>
          ) : (
            items
          )}
        </Flex>
      )}
    ></Box>
  );
};

export default SearchBar;
