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
import { FC, ReactNode } from "react";
import { Release, Releases } from "../../types";
import Tag from "../Tag";
import slugify from "../../../lib/slugify";
import ReleaseCardSkeleton from "./ReleaseCardSkeleton";

const SearchResultsItemWrapper: FC<{ children?: ReactNode }> = ({
  children,
}) => (
  <GridItem
    as={Flex}
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    position="relative"
    style={{ aspectRatio: "1/1" }}
  >
    {children}
  </GridItem>
);

const SearchResultsLoading: FC = () => {
  return (
    <>
      {Array.from({ length: 9 }, (_, i) => (
        <SearchResultsItemWrapper key={i}>
          <ReleaseCardSkeleton />
        </SearchResultsItemWrapper>
      ))}
    </>
  );
};

const SearchResultsItem: FC<{ release: Release }> = ({ release }) => {
  const theme = useTheme();
  return (
    <GridItem
      as={Link}
      prefetch={false}
      style={{ aspectRatio: "1/1" }}
      overflow="hidden"
      position="relative"
      boxShadow={`1px 1px 4px ${theme.colors.grey["500"]}`}
      href={`/release/${release.id}-${slugify(release.title)}`}
    >
      {release.images[0] ? (
        <Image
          alt={`${release.title} cover art`}
          src={release.images[0]}
          loading="lazy"
          position="absolute"
          height="100%"
          width="auto"
          top={0}
          left="50%"
          transform="translateX(-50%)"
        />
      ) : (
        <Box />
      )}
      <Flex
        position="absolute"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        height="100%"
        width="100%"
        zIndex={1}
        padding="0.625rem"
        background="rgba(51,51,51,0.5)"
        transition="opacity 0.4s ease"
        opacity={1}
        _hover={release.images[0] ? { opacity: 0 } : {}}
      >
        <Text
          textTransform="uppercase"
          fontSize="1rem"
          color="white.200"
          fontFamily="'Roboto Condensed', sans-serif"
          fontWeight={700}
          marginBottom="1rem"
          textAlign="center"
        >
          {release.title}
        </Text>
        <Flex
          width="80%"
          flexWrap="wrap"
          gap="0.3rem"
          alignItems="center"
          justifyContent="center"
        >
          {release.tags.map((tag, i) => (
            <Tag key={i}>{tag}</Tag>
          ))}
        </Flex>
      </Flex>
    </GridItem>
  );
};

const SearchResults: FC<{
  results: Releases;
  loading: boolean;
  title?: string;
}> = ({ loading, results, title }) => {
  return (
    <Flex flexDirection="column" width="100%" alignItems="center">
      {title && (
        <Text
          as="h1"
          fontFamily="'Roboto Condensed', sans-serif"
          fontWeight={700}
          textTransform="uppercase"
          fontSize="1rem"
          color="grey.200"
        >
          {title}
        </Text>
      )}
      <Grid
        paddingTop="2rem"
        width="80%"
        maxWidth="800px"
        templateColumns={{
          sm: "repeat(1, 1fr)",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
        }}
        gap="1rem"
      >
        {results.map((release, i) => (
          <SearchResultsItem release={release} key={i} />
        ))}
        {loading && <SearchResultsLoading />}
      </Grid>
    </Flex>
  );
};

export default SearchResults;
