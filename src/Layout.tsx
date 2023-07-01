import { AppShell, Navbar, Text, useMantineTheme } from "@mantine/core";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { useCallback, useState } from "react";

import Header from "./layout/Header";
import ScannerScreen from "./screens/Scanner";
import ShoppingListBuilderScreen from "./screens/ShoppingListBuilder";
import ShoppingListScreen from "./screens/ShoppingListDetail";
import { AuthProvider } from "./context/auth";

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

  const onAuthError = useCallback((error: Error, message: string) => {
    notifications.show({
      color: "red",
      title: "Error",
      message: message,
    });
    console.log(message);
    console.error(error);
  }, []);

  const onAuthSuccess = useCallback((message: string) => {
    notifications.show({
      color: "green",
      title: "Success",
      message: message,
    });
    console.log(message);
  }, []);

  return (
    <AuthProvider onError={onAuthError} onSuccess={onAuthSuccess}>
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
        header={<Header onBurger={(opened) => setOpened(opened)} />}
      >
        <RouterProvider router={router} />
      </AppShell>
    </AuthProvider>
  );
}
