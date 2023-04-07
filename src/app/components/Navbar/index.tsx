import { Box, Flex, Grid, GridItem } from "@chakra-ui/react";
import styled from "@emotion/styled";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import SearchBar from "../SearchBar";
import { Theme } from "../../theme";
import logo from "./logo.svg";

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  height: 100%;
`;

const LogoLink = styled(NavLink)`
  background: ${({ theme }) => (theme as Theme).colors.yellow["200"]};
  aspect-ratio: 1/1;
  justify-content: center;
`;

const TextLink = styled(NavLink)`
  color: ${({ theme }) => (theme as Theme).colors.white["100"]};
  font-size: 0.875rem;
  text-transform: uppercase;
  line-height: 4.3em;
  font-family: "Roboto Condensed", sans-serif;
  font-weight: 700;
  letter-spacing: 1px;
  word-spacing: 1px;
  transition: box-shadow 0.1s ease;
  &:hover {
    box-shadow: inset 0px -5px 0px 0px ${({ theme }) => (theme as Theme).colors.yellow["200"]};
  }
`;

const Navbar: FC = () => {
  return (
    <Grid
      as="nav"
      width="100%"
      backgroundColor="black"
      role="navigation"
      templateAreas={{
        base: `"logo   links"
               "search search"`,
        md: `"logo search links links"`,
      }}
      gridTemplateRows={{
        base: "2rem 3.5rem",
        md: "3.75rem",
      }}
      gridTemplateColumns={{
        base: "auto auto",
        md: "1fr 400px minmax(auto, 400px) minmax(auto, 1fr)",
      }}
      justifyItems="center"
      alignItems="center"
      paddingX={{
        md: "2rem",
      }}
    >
      <GridItem
        area={"logo"}
        height="100%"
        justifySelf="start"
        marginRight="1rem"
      >
        <LogoLink href="/">
          <Box
            as={Image}
            alt="mightygoose logo"
            src={logo}
            height="60%"
            width="auto"
          />
        </LogoLink>
      </GridItem>
      <GridItem
        area={"search"}
        width="100%"
        paddingX={{
          base: "0.3rem",
          md: 0,
        }}
      >
        <SearchBar />
      </GridItem>
      <GridItem area={"links"} justifySelf="end">
        <TextLink href="/releases">All Releases</TextLink>
      </GridItem>
    </Grid>
  );
};

export default Navbar;
