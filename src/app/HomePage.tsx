"use client";

import Link from "next/link";
import { Box, Flex, Text, Button } from "@chakra-ui/react";
import { FC } from "react";
import HeadingLine from "./components/HeadingLine";
import SearchResults from "./components/SearchResults";
import { Releases as TReleases } from "./types";

const HomePage: FC<{ releases: TReleases }> = ({ releases }) => {
  return (
    <>
      <Flex
        as="section"
        maxWidth="800px"
        textAlign="center"
        flexDirection="column"
        gap="2rem"
        paddingY="4rem"
        width={{
          base: "80%",
          md: "100%",
        }}
      >
        <Text
          as="h3"
          color="black"
          textTransform="uppercase"
          fontFamily="'Roboto Condensed', sans-serif"
          fontWeight={700}
          fontSize="1.1rem"
          letterSpacing={1}
          lineHeight="1.4rem"
          style={{
            wordSpacing: 1,
          }}
        >
          MightyGoose is the ultimate music discovery platform
        </Text>
        <Text as="p" color="grey.300" fontWeight={300} fontSize="1rem">
          We aggregate music blogs and connect them to the most up-to-date music
          databases like Discogs, Spotify, Deezer, etc. Our platform makes it
          simple and easy to search for and discover new music from around the
          world. Whether you are an avid music fan, just getting into music, or
          a music blogger yourself, we have something for everyone. MightyGoose
          is the perfect tool to help you find the music you love.
        </Text>
      </Flex>
      <Flex
        as="section"
        width="100%"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <HeadingLine title="recently added" />
        <SearchResults loading={false} results={releases} />
        <Flex
          marginY={16}
          gap="3rem"
          justifyContent="center"
          alignItems="center"
          flexDirection={{
            base: "column",
            md: "row",
          }}
          width={{
            base: "80%",
            md: "100%",
          }}
        >
          <Button
            as={Link}
            href="/posts"
            prefetch={false}
            paddingX={12}
            paddingY={6}
            fontSize="1.125rem"
          >
            explore more
          </Button>
          <Button
            as={Link}
            href="/post/random"
            prefetch={false}
            paddingX={12}
            paddingY={6}
            fontSize="1.125rem"
          >
            or try random release
          </Button>
        </Flex>
      </Flex>
    </>
  );
};

export default HomePage;
