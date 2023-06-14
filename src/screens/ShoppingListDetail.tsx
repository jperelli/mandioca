import { Badge, Image, Stack, Text } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "@mantine/hooks";
import { useParams } from "react-router-dom";

import { Product, ShoppingList, ShoppingListItem } from "../schema";

export default function ShoppingListDetailScreen() {
  const { id } = useParams();
  const [sl, setSl] = useState<ShoppingList>();

  useEffect(() => {
    const sl = Object.keys(localStorage)
      .filter((key) => key.startsWith("shoppinglist-"))
      .find((key) => JSON.parse(localStorage.getItem(key) as string).id === id);
    setSl(JSON.parse(localStorage.getItem(sl as string) as string));
  }, [id]);

  const [products] = useLocalStorage<Array<Product>>({
    key: "products",
    defaultValue: [],
  });

  const [selectedRecords, setSelectedRecords] = useState<
    Array<ShoppingListItem>
  >([]);

  const tableData = useMemo(
    () =>
      sl?.items.map((item) => ({
        ...item,
        product: products.find((p) => p.barcode === item.barcode),
      })),
    [sl, products]
  );

  return (
    <Stack align="stretch" justify="center">
      <Text>{sl?.name}</Text>
      <DataTable<ShoppingListItem>
        withBorder
        borderRadius="sm"
        withColumnBorders
        striped
        idAccessor="barcode"
        records={tableData}
        selectedRecords={selectedRecords}
        onSelectedRecordsChange={setSelectedRecords}
        onRowClick={(item) =>
          setSelectedRecords((prev) => {
            if (prev.includes(item)) {
              return prev.filter((i) => i !== item);
            }
            return [...prev, item];
          })
        }
        columns={[
          {
            accessor: "product_image",
            render: (item) => (
              <Image
                maw={100}
                height={100}
                fit="cover"
                mx="auto"
                radius="md"
                src={item.product?.image}
              />
            ),
          },
          {
            accessor: "product_name",
            render: (item) => {
              const product = item.product;
              return (
                <div>
                  <Badge>
                    {product
                      ? product.brands?.split(",")?.[0] || "?"
                      : "Unrecognized"}
                  </Badge>
                  <div>{product ? product.name : item.barcode}</div>
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
      />
    </Stack>
  );
}
