"use client";

import { Box, ComponentDefaultProps } from "@chakra-ui/react";
import { FC } from "react";
import { Img } from "react-image";

interface Props extends ComponentDefaultProps {
  src: Array<string>;
  alt: string;
}

const Image: FC<Props> = ({ src, alt, ...rest }) => {
  return <Box as={Img} alt={alt} src={src} loading="lazy" {...rest} />;
};

export default Image;
