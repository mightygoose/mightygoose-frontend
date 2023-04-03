"use client";

import { FC, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Image,
  Text,
  useTheme,
} from "@chakra-ui/react";
import Iframe from "react-iframe";
import ReactPlayer from "react-player";
import getYouTubeID from "get-youtube-id";
import styled from "@emotion/styled";
import Tag from "../../components/Tag";
import { Release as TRelease, DiscogsInfo } from "../../types";
import fetch from "../../../lib/fetch";
import ReleaseLinks from "../../components/ReleaseLinks";

const useDiscogsInfo = (release: TRelease) => {
  const [discogsInfo, setDiscogsInfo] = useState<DiscogsInfo | null>(null);

  useEffect(() => {
    if (!release.discogs) {
      return;
    }
    (async () => {
      const response = await fetch<DiscogsInfo>("/api/discogs_info", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resource_url: release.discogs.resource_url,
        }),
      });
      setDiscogsInfo(response);
    })();
  }, [release.discogs]);

  return discogsInfo;
};

enum EMBED_TYPES {
  YOUTUBE = "youtube",
}

interface EmbedItem {
  url: string;
  type: EMBED_TYPES | null;
}

const getEmbed = (url: string): EmbedItem => {
  if (/youtube|youtu\.be/.test(url)) {
    const youtubeId = getYouTubeID(url);
    return {
      type: EMBED_TYPES.YOUTUBE,
      url: `//www.youtube.com/embed/${youtubeId}`,
    };
  }
  return {
    type: null,
    url,
  };
};

const getEmbeds = (release: TRelease): Array<EmbedItem> => {
  return release.embed.reduce<Array<EmbedItem>>((acc, html) => {
    try {
      const src =
        html.match(/<(iframe|embed).*?src=["|'](.*?)["|']/)?.[2] ||
        html.match(/<object.*?data=["|'](.*?)["|']/)?.[1];
      if (src) {
        return [...acc, getEmbed(src)];
      } else {
        return acc;
      }
    } catch (e) {
      return acc;
    }
  }, []);
};

export const NotFound: FC = () => (
  <Text
    fontFamily={`'Roboto Condensed',sans-serif`}
    fontWeight={700}
    paddingTop="3rem"
  >
    Sorry, we could not find this release
  </Text>
);

const Release: FC<{ release: TRelease }> = ({ release }) => {
  const theme = useTheme();
  const discogsInfo = useDiscogsInfo(release);

  const embeds = getEmbeds(release);

  return (
    <Flex
      as="section"
      width="100%"
      textAlign="center"
      alignItems="center"
      flexDirection="column"
    >
      <Flex
        as="article"
        width="100%"
        backgroundColor="grey.100"
        paddingY="3.75rem"
        alignItems="center"
        justifyContent="center"
      >
        <Grid
          width="90%"
          maxWidth="800px"
          backgroundColor="white.100"
          boxShadow={`1px 1px 4px ${theme.colors.grey["500"]}`}
          padding={{
            base: "1.3rem",
            sm: "2.5rem",
          }}
          borderRadius={5}
          gap="2rem"
          templateAreas={{
            base: `"image"
                   "links"
                   "media"
                    `,
            md: `"image links"
                 "media media"
                  `,
          }}
          templateColumns={{
            base: "100%",
            md: "40% auto",
          }}
        >
          <GridItem area="image" style={{ aspectRatio: "1/1" }} flexBasis="40%">
            <Image
              alt={`${release.title} cover art`}
              src={release.images[0] || discogsInfo?.images[0]?.uri}
              width="100%"
              loading="lazy"
            />
          </GridItem>

          <GridItem
            as={Flex}
            area="links"
            flexDirection="column"
            textAlign="left"
            gap="1rem"
            alignItems="flex-start"
          >
            <Text
              as="h4"
              fontFamily={`"Roboto Condensed", sans-serif`}
              fontWeight={700}
              fontSize="1rem"
              textTransform="uppercase"
              color="black"
              style={{
                wordSpacing: 1,
              }}
            >
              {release.title}
            </Text>
            <Flex width="100%" flexWrap="wrap" gap="0.5rem">
              {release.tags.map((tag, i) => (
                <Tag
                  as={Link}
                  prefetch={false}
                  href={`/posts?tag=${tag}`}
                  fontSize="0.7rem"
                  key={i}
                >
                  {tag}
                </Tag>
              ))}
            </Flex>
            {release.sh_type === "BlogPostItem" && (
              <Text
                as={Link}
                href={release.url}
                backgroundColor="yellow.200"
                textDecoration="underline"
                color="black"
                fontSize="0.8125rem"
                paddingY="0.4rem"
                paddingX="0.8125rem"
              >
                Original post link
              </Text>
            )}
            <ReleaseLinks release={release} />
          </GridItem>
          <GridItem as={Flex} flexDirection="column" gap="1rem" area="media">
            <Flex flexDirection="column" width="100%" gap="1rem">
              {embeds.map(({ url }, i) => (
                <Box as={Iframe} key={"" + i} url={url} />
              ))}
            </Flex>
            {discogsInfo && discogsInfo.videos && (
              <Flex width="100%">
                <ReactPlayer
                  width="100%"
                  url={discogsInfo.videos.map(({ uri }) => uri)}
                  controls
                />
              </Flex>
            )}
          </GridItem>
        </Grid>
      </Flex>
    </Flex>
  );
};

export default Release;
