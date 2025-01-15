import React from 'react';
import { HStack, Button, Avatar, Wrap, WrapItem, Spacer } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <HStack p="4" shadow="base" bgColor="blackAlpha.900">
      <Button variant="unstyled" color="white">
        <Link to="/">Home</Link>
      </Button>
      <Button variant="unstyled" color="white">
        <Link to="/docs">Docs</Link>
      </Button>
      <Button variant="unstyled" color="white">
        <Link to="/events">Events</Link>
      </Button>
      <Button variant="unstyled" color="white">
        <Link to="/contact">Contact</Link>
      </Button>
      <Spacer />
      <Avatar name='TEC' src='/download.jpeg' />
    </HStack>
  );
};

export default Header;