import { Button, Modal, SegmentedControl, Stack } from "@mantine/core";
import { Link } from "react-router-dom";
import { QrcodeSuccessCallback } from "html5-qrcode";
import { notifications } from "@mantine/notifications";
import { useCallback, useMemo } from "react";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { uuidv7 } from "uuidv7";

import BarcodeReader from "../components/BarcodeReader";
import ItemForm from "../components/ItemForm";
import Table from "../components/Table";
import { Product, StockRecord } from "../schema";
import { getProductFromOFF } from "../utils";

type MODE = "ADD" | "REMOVE";

export default function ScannerScreen() {
  const [opened, { open, close }] = useDisclosure(false);
  const [mode, setMode] = useLocalStorage<MODE>({
    key: "mode",
    defaultValue: "REMOVE",
  });

  const [, setItems] = useLocalStorage<Array<StockRecord>>({
    key: "items",
    defaultValue: [],
  });

  const [, setProducts] = useLocalStorage<Array<Product>>({
    key: "products",
    defaultValue: [],
  });

  const onScanSuccess: QrcodeSuccessCallback = useCallback(
    async (decodedText, decodedResult) => {
      const newItem: StockRecord = {
        id: uuidv7(),
        executedAt: new Date().toISOString(),
        code: decodedText,
        code_format: decodedResult.result.format?.formatName || "",
        quantity: mode === "ADD" ? 1 : -1,
      };
      setItems((items) => items.concat([newItem]));
      try {
        const newProduct = await getProductFromOFF(decodedText);
        setProducts((products) => products.concat([newProduct]));
      } catch (e) {
        notifications.show({
          title: "Error",
          message: "Product not found in OpenFoodFacts",
          color: "red",
        });
      }
    },
    [setItems, setProducts, mode]
  );

  const onSubmitAdd = useCallback(
    async (newItem: StockRecord) => {
      setItems((items) => items.concat([newItem]));
      close();
    },
    [setItems, close]
  );

  const config = useMemo(() => {
    return {
      fps: 3,
    };
  }, []);

  return (
    <Stack align="stretch" justify="center">
      <Link to="/shoppinglistbuilder">Create Shopping List</Link>
      <SegmentedControl
        value={mode}
        onChange={setMode as (value: string) => void}
        fullWidth
        data={["ADD", "REMOVE"]}
      />
      <BarcodeReader onSuccess={onScanSuccess} config={config} />
      <Table />
      <Button onClick={open}>Add Manual</Button>
      <Modal opened={opened} onClose={close} title="Add Manual" centered>
        <ItemForm onSubmit={onSubmitAdd} />
      </Modal>
    </Stack>
  );
}
