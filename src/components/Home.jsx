import { Box, Image } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import React from 'react';

// Keyframes for seamless scrolling
const spin = keyframes`  
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); } // Scroll half of the container for seamless looping
`;

const Home = () => {
  const spinAnimation = `${spin} infinite 10s linear`;

  // Repeating "New Event" dynamically
  const repeatText = Array(10).fill('New Event'); // Adjust repetitions to fit one full screen width

  return (
    <>
      {/* Dynamic Scrolling Words */}
      <Box
        overflow="hidden" // Prevent overflow outside the container
        whiteSpace="nowrap"
        position="relative"
        width="100%"
        bg="green.600"
        fontSize="20px"
        fontWeight="bold"
        color="white"
      >
        {/* Scrolling text container */}
        <Box
          display="inline-block"
          animation={spinAnimation}
          whiteSpace="nowrap"
        >
          {/* Render the first row of text */}
          {repeatText.map((text, index) => (
            <Box key={index} display="inline-block" mx={4}>
              {text}
            </Box>
          ))}
          {/* Repeat the row for seamless scrolling */}
          {repeatText.map((text, index) => (
            <Box key={`repeat-${index}`} display="inline-block" mx={4}>
              {text}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Static Content */}
      <Image
        width="auto"
        margin="auto"
        padding="5"
        boxSize="30%"
        src="/TechMeet.jpg"
        alt="Tech Meetup"
        borderRadius="50px"
      />
      <Box display="flex" justifyContent="space-evenly">
        <Image
          boxSize="30%"
          src="/TechMeet.jpg"
          alt="Tech Meetup"
          borderRadius="50px"
        />
        <Image
          boxSize="30%"
          src="/TechMeet.jpg"
          alt="Tech Meetup"
          borderRadius="50px"
        />
        <Image
          boxSize="30%"
          src="/TechMeet.jpg"
          alt="Tech Meetup"
          borderRadius="50px"
        />
      </Box>
    </>
  );
};

export default Home;
