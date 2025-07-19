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
      {/* <Image
        width="auto"
        margin="auto"
        padding="5"
        boxSize="30%"
        src="/TechMeet.jpg"
        alt="Tech Meetup"
        borderRadius="50px"
      /> */}
      <Box display="flex" justifyContent="space-evenly" paddingTop={'20px'}>
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

      {/* About Section */}
      <Box id="about" mt={16} mb={16} px={8} py={10} bg="gray.100" borderRadius={12} boxShadow="md">
        <h2 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 12 }}>About Us</h2>
        <p style={{ fontSize: 18, color: '#333' }}>
          Welcome to The Echo Community! We are a vibrant group of tech enthusiasts, innovators, and learners dedicated to fostering growth, collaboration, and positive change. Our mission is to empower members through knowledge sharing, hands-on projects, and a supportive network. Whether you are a student, professional, or hobbyist, TEC is your platform to echo change in the world of technology.
        </p>
      </Box>

      {/* Projects Section */}
      <Box id="projects" mt={16} mb={16} px={8} py={10} bg="gray.50" borderRadius={12} boxShadow="md">
        <h2 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 12 }}>Our Projects</h2>
        <p style={{ fontSize: 18, color: '#333' }}>
          Explore our diverse range of projects, from innovative apps and community-driven platforms to research initiatives and tech workshops. Our members collaborate on real-world challenges, building solutions that make a difference. Stay tuned for featured projects and opportunities to contribute!
        </p>
      </Box>

      {/* Partners Section */}
      <Box id="partners" mt={16} mb={16} px={8} py={10} bg="gray.200" borderRadius={12} boxShadow="md">
        <h2 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 12 }}>Our Partners & Sponsors</h2>
        <p style={{ fontSize: 18, color: '#333' }}>
          We are grateful for the support and collaboration of our partners and sponsors. Their contributions help us drive innovation, host impactful events, and empower our community. <br />
          <br />
          <b>Featured Partners:</b>
        </p>
        <ul style={{ fontSize: 18, color: '#333', marginTop: 16 }}>
          <li>Partner/Sponsor 1</li>
          <li>Partner/Sponsor 2</li>
          <li>Partner/Sponsor 3</li>
          {/* Add more partners as needed */}
        </ul>
      </Box>
    </>
  );
};

export default Home;
