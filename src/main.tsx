import "dayjs/locale/es"; // import { registerSW } from "virtual:pwa-register";

import React from "react";
import ReactDOM from "react-dom/client";
import { DatesProvider } from "@mantine/dates";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import Layout from "./Layout";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Notifications />
      <DatesProvider
        settings={{ locale: "es", firstDayOfWeek: 0, weekendDays: [0] }}
      >
        <Layout />
      </DatesProvider>
    </MantineProvider>
  </React.StrictMode>
);

// const updateSW = registerSW({
//   onNeedRefresh() {
//     console.log("onNeedRefresh");
//   },
//   onOfflineReady() {
//     console.log("onOfflineReady");
//   },
// });
