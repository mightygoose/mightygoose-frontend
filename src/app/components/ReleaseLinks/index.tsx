"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import Image from "next/image";
import { FC } from "react";
import Tag from "../../components/Tag";
import { Release as TRelease } from "../../types";
import discogsLogo from "./discogs.svg";
import spotifyLogo from "./spotify.svg";
import deezerLogo from "./deezer.svg";

const LogoImage: FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <Box
    alt={alt}
    as={Image}
    height="100%"
    width="auto"
    filter="grayscale(100%)"
    src={src}
    _hover={{
      filter: "none",
    }}
  />
);

const ReleaseLinks: FC<{ release: TRelease }> = ({ release }) => {
  const links = [];
  if (release.discogs) {
    links.push({
      label: <LogoImage alt="discogs logo" src={discogsLogo} />,
      url: `https://www.discogs.com/release/${release.discogs.id}`,
    });
  }
  if (release.spotify) {
    links.push({
      label: <LogoImage alt="spotify logo" src={spotifyLogo} />,
      url: `https://open.spotify.com/album/${release.spotify.id}`,
    });
  }
  if (release.deezer) {
    links.push({
      label: (
        <Box height="1.1rem">
          <LogoImage alt="deezer logo" src={deezerLogo} />
        </Box>
      ),
      url: release.deezer.deezer_link,
    });
  }

  if (!links.length) {
    return null;
  }
  return (
    <Flex flexDirection="column" gap="0.4rem" marginTop="1rem" width="100%">
      <Text
        fontFamily={`"Roboto",sans-serif`}
        fontSize="0.75rem"
        textTransform="uppercase"
      >
        find it on:
      </Text>
      <Flex width="100%" flexWrap="wrap" gap="2rem" alignItems="center">
        {links.map(({ label, url }, i) => (
          <Box
            key={i}
            as={Link}
            href={url}
            fontSize="0.8rem"
            height="1.4rem"
            color="black"
            opacity={0.4}
            transition="opacity 0.1s"
            _hover={{
              opacity: 1,
            }}
          >
            {label}
          </Box>
        ))}
      </Flex>
    </Flex>
  );
};

export default ReleaseLinks;
