'use client';

import { Container, VStack, Text, Button, Box, HStack, Tag } from '@chakra-ui/react';

export default function HomePage() {
  return (
    <Container maxW="container.xl" py={{ base: 10, md: 16 }}>
      <VStack spacing={10} align="stretch">
        <VStack spacing={4} align="start">
          <HStack spacing={3}>
            <Tag colorScheme="green" variant="subtle">
              On-chain growth
            </Tag>
            <Tag colorScheme="teal" variant="subtle">
              Weekly impact batches
            </Tag>
          </HStack>
          <Text fontSize={{ base: '3xl', md: '5xl' }} fontWeight="bold">
            DenGrow
          </Text>
          <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.600" maxW="2xl">
            Mint a plant NFT, water it daily, and graduate it into the Impact Pool. DenGrow
            prioritizes verifiable care and transparent weekly redemptions.
          </Text>
          <HStack spacing={4}>
            <Button as="a" href="/my-plants" colorScheme="green" size="lg">
              View My Plants
            </Button>
            <Button as="a" href="/my-plants" variant="outline" size="lg">
              Mint a Plant
            </Button>
          </HStack>
        </VStack>

        <Box borderWidth="1px" borderRadius="lg" p={{ base: 6, md: 8 }} bg="white" boxShadow="sm">
          <VStack spacing={3} align="start">
            <Text fontSize="lg" fontWeight="bold">
              Daily Care Loop
            </Text>
            <Text color="gray.600">
              Water once per day to grow your plant. After 7 successful days, it becomes a Tree and
              joins the global Impact Pool for weekly batch redemption.
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}
