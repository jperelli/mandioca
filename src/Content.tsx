import { Button, Modal, Stack } from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import ItemForm, { type Values } from "./ItemForm";
import Table from "./Table";
import Scanner from "./Scanner";
import { QrcodeSuccessCallback } from "html5-qrcode";
import UUID from "pure-uuid";
import { useCallback } from "react";

export default function Content() {
  const [opened, { open, close }] = useDisclosure(false);

  const [items, setItems] = useLocalStorage<Array<Values>>({
    key: "items",
    defaultValue: [],
  });

  const onScanSuccess: QrcodeSuccessCallback = useCallback(
    async (decodedText, decodedResult) => {
      const newItem: Values = {
        id: new UUID(4).toString(),
        consumedAt: new Date().toISOString(),
        code: decodedText,
        code_format: decodedResult.result.format?.formatName || "",
      };
      setItems(items.concat([newItem]));
    },
    [items, setItems]
  );

  const onSubmitAdd = async (newItem: Values) => {
    setItems(items.concat([newItem]));
    close();
  };

  return (
    <Stack align="stretch" justify="center">
      <Scanner
        onSuccess={onScanSuccess}
        fps={1}
      />

      <Table />

      <Button onClick={open}>Add Manual</Button>
      <Modal opened={opened} onClose={close} title="Add Manual" centered>
        <ItemForm onSubmit={onSubmitAdd} />
      </Modal>
    </Stack>
  );
}
