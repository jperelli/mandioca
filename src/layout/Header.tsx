import {
  Avatar,
  Burger,
  Header as MantineHeader,
  MediaQuery,
  Menu,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { IconStepOut } from "@tabler/icons-react";
import { useContext } from "react";
import { useDisclosure } from "@mantine/hooks";

import AuthContext from "../context/auth";

interface HeaderProps {
  onBurger: (opened: boolean) => void;
}

export default function Header({ onBurger }: HeaderProps) {
  const theme = useMantineTheme();
  const [opened, { toggle: toggleOpened }] = useDisclosure(false, {
    onOpen: () => onBurger(true),
    onClose: () => onBurger(false),
  });
  const { session, logout } = useContext(AuthContext);

  return (
    <MantineHeader height={{ base: 50, md: 70 }} p="md">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
          justifyContent: "space-between",
        }}
      >
        <div>
          <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            <Burger
              opened={opened}
              onClick={toggleOpened}
              size="sm"
              color={theme.colors.gray[6]}
              mr="xl"
            />
          </MediaQuery>
        </div>

        <Menu>
          <Menu.Target>
            <Avatar
              radius="xl"
              src={session?.user.user_metadata?.avatar_url}
            ></Avatar>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item icon={<IconStepOut size={rem(14)} />} onClick={logout}>
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </MantineHeader>
  );
}
