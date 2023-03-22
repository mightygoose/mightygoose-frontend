import { Flex, Skeleton } from "@chakra-ui/react";
import { FC } from "react";

const ReleaseCardSkeleton: FC = () => (
  <>
    <Skeleton
      position="absolute"
      startColor="grey.100"
      endColor="grey.300"
      width="100%"
      height="100%"
    />
    <Skeleton
      width="80%"
      height="1.4rem"
      startColor="grey.100"
      endColor="grey.200"
    />
    <Flex marginTop="0.8rem" width="100%" justifyContent="center" gap="1rem">
      <Skeleton
        width="20%"
        height="1.2rem"
        startColor="grey.100"
        endColor="grey.200"
      />
      <Skeleton
        width="30%"
        height="1.2rem"
        startColor="grey.100"
        endColor="grey.200"
      />
    </Flex>
  </>
);

export default ReleaseCardSkeleton;
