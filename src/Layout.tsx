import {
  AppShell,
  Burger,
  Header,
  MediaQuery,
  Navbar,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useState } from "react";

import ScannerScreen from "./screens/Scanner";
import ShoppingListBuilderScreen from "./screens/ShoppingListBuilder";
import ShoppingListScreen from "./screens/ShoppingListDetail";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ScannerScreen />,
  },
  {
    path: "/shoppinglistbuilder",
    element: <ShoppingListBuilderScreen />,
  },
  {
    path: "/shoppinglist/:id",
    element: <ShoppingListScreen />,
  },
]);

export default function AppShellDemo() {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);

  return (
    <AppShell
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 200, lg: 300 }}
        >
          <Text>Application navbar</Text>
        </Navbar>
      }
      header={
        <Header height={{ base: 50, md: 70 }} p="md">
          <div
            style={{ display: "flex", alignItems: "center", height: "100%" }}
          >
            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
                mr="xl"
              />
            </MediaQuery>

            <Text></Text>
          </div>
        </Header>
      }
    >
      <RouterProvider router={router} />
    </AppShell>
  );
}
