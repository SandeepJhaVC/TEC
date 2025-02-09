import React from 'react';
import { HStack, Button, Avatar, Spacer, color } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <HStack p="4" shadow="base" bgColor="whiteAlpha.100">
      <Avatar name='TEC' src='/download.jpeg' />
      <Spacer />
      {/* <div className="button">

      </div> */}
      <Button>
        <Link to="/certificates">Certificates</Link>
      </Button>
      <Button>
        <Link to="/about">About</Link>
      </Button>
      <Button>
        <Link to="/projects">Projects</Link>
      </Button>
      <Button>
        <Link to="/partners">Partners</Link>
      </Button>
      <Spacer />
      <Button variant={'unstyled'}>
        <Link to="/register">JOIN US</Link>
      </Button>
    </HStack>
  );
};

export default Header;