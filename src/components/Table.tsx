import { Badge, Button, CopyButton, Image, Modal } from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useCallback, useMemo, useState } from "react";
import { useLocalStorage } from "@mantine/hooks";

import ItemForm from "./ItemForm";
import { DateTime, getProductFromOFF } from "../utils";
import { Product, StockRecord } from "../schema";

export default function Content() {
  const [editItem, setEditItem] = useState<StockRecord | null>(null);

  const [items, setItems] = useLocalStorage<Array<StockRecord>>({
    key: "items",
    defaultValue: [],
  });

  const [products, setProducts] = useLocalStorage<Array<Product>>({
    key: "products",
    defaultValue: [],
  });

  const getProductsForItems = useCallback(async () => {
    // get products for items that don't have products
    // get them from openfoodfacts
    // save them to products
    const itemsWithoutProducts = items.filter(
      (item) => !products.find((product) => product.barcode === item.code)
    );
    if (itemsWithoutProducts.length === 0) return;
    const barcodes = itemsWithoutProducts.map((item) => item.code);
    for (const barcode of barcodes) {
      try {
        const newProduct = await getProductFromOFF(barcode);
        setProducts((products) => products.concat([newProduct]));
      } catch (error) {
        console.error(error);
        notifications.show({
          title: "Warning",
          message: "Product not found",
          color: "red",
        });
      }
    }
    // window.location.reload();
  }, [items]);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "executedAt",
    direction: "desc",
  });

  const tableData = useMemo(() => {
    const data = [...items];
    const colName = sortStatus.columnAccessor as keyof StockRecord;
    data.sort((a, b) => {
      const av = a[colName] || 0;
      const bv = b[colName] || 0;
      if (av < bv) {
        return sortStatus.direction === "asc" ? -1 : 1;
      }
      if (av > bv) {
        return sortStatus.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return data;
  }, [sortStatus, items]);

  const onSubmitEdit = useCallback(
    async (editedItem: StockRecord) => {
      setItems((items) => {
        if (!items.find((item) => item.id === editedItem.id)) return items;
        return items.map((item) =>
          item.id === editedItem.id ? editedItem : item
        );
      });
      setEditItem(null);
    },
    [setItems, setEditItem]
  );

  const onDelete = useCallback(
    async (id: string) => {
      setItems((items) => items.filter((item) => item.id !== id));
      setEditItem(null);
    },
    [setItems, setEditItem]
  );

  return (
    <>
      <Modal
        opened={Boolean(editItem)}
        onClose={() => setEditItem(null)}
        title="Edit Consulta"
        centered
      >
        {editItem ? (
          <ItemForm
            onSubmit={onSubmitEdit}
            onDelete={onDelete}
            initialStockRecord={editItem}
          />
        ) : null}
      </Modal>

      <DataTable<StockRecord>
        withBorder
        borderRadius="sm"
        withColumnBorders
        striped
        highlightOnHover
        records={tableData}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        columns={[
          {
            accessor: "executedAt",
            title: "At",
            sortable: true,
            render: (item) => <DateTime dateString={item.executedAt} />,
          },
          {
            accessor: "product_image",
            render: (item) => (
              <Image
                maw={100}
                height={100}
                fit="cover"
                mx="auto"
                radius="md"
                src={products.find((p) => p.barcode === item.code)?.image}
              />
            ),
          },
          {
            accessor: "product_name",
            render: (item) => {
              const product = products.find((p) => p.barcode === item.code);
              return (
                <div>
                  <Badge>
                    {product
                      ? product.brands?.split(",")?.[0] || "?"
                      : "Unrecognized"}
                  </Badge>
                  <div>{product ? product.name : item.code}</div>
                </div>
              );
            },
          },
          {
            accessor: "quantity",
            title: "Q",
            render: (item) => item.quantity,
          },
        ]}
        onRowClick={(item) => setEditItem(item)}
      />

      <Button onClick={() => getProductsForItems()}>
        Get Products from Items
      </Button>

      <CopyButton value={JSON.stringify(items)} timeout={2000}>
        {({ copied, copy }) => (
          <Button
            onClick={copy}
            color={copied ? "teal" : undefined}
            leftIcon={copied ? <IconCheck /> : <IconCopy />}
          >
            {copied ? "Copied!" : "Copy to clipboard"}
          </Button>
        )}
      </CopyButton>
    </>
  );
}
