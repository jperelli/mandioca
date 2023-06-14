import UUID from "pure-uuid";
import { Badge, Button, Image, Stack, Text } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { useCallback, useMemo, useState } from "react";
import { useLocalStorage } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";

import { DateTime } from "../utils";
import {
  Product,
  ShoppingList,
  ShoppingListItem,
  StockRecord,
} from "../schema";

export default function ShoppingListBuilderScreen() {
  const navigate = useNavigate();
  const [items] = useLocalStorage<Array<StockRecord>>({
    key: "items",
    defaultValue: [],
  });

  const [products] = useLocalStorage<Array<Product>>({
    key: "products",
    defaultValue: [],
  });

  const tableData = useMemo(() => {
    // return xs.reduce(function(rv, x) {
    //   (rv[x[key]] = rv[x[key]] || []).push(x);
    //   return rv;
    // }, {});

    const its = items
      // group / count by barcode
      .reduce((items, item) => {
        const existingItem = items.find((i) => i.code === item.code);
        if (existingItem) {
          existingItem.quantity += item.quantity;
          return items;
        }
        return items.concat([item]);
      }, [] as Array<StockRecord>)
      // filter out items that are after a week in the past
      .filter(
        (item) =>
          item.quantity < 0 &&
          new Date(item.executedAt) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      )
      // backfill product data
      .map((item) => ({
        barcode: item.code,
        product: products.find((p) => p.barcode === item.code),
        quantity: 1,
        done: false,
      }))
      // sort by product name
      .sort((a, b) => {
        const an = a.product?.name || a.barcode;
        const bn = b.product?.name || b.barcode;
        return an.localeCompare(bn);
      });
    return its;
  }, [items]);

  const [selectedRecords, setSelectedRecords] = useState<
    Array<ShoppingListItem>
  >([]);

  const createShoppingList = useCallback(() => {
    const shoppingList: ShoppingList = {
      id: new UUID(4).format(),
      name: `Shopping list ${new Date().toISOString().slice(0, 10)}`,
      items: selectedRecords.map((item) => ({
        barcode: item.barcode,
        quantity: item.quantity,
        done: false,
      })),
    };
    localStorage.setItem(
      `shoppinglist-${new Date().toISOString()}`,
      JSON.stringify(shoppingList)
    );
    navigate(`/shoppinglist/${shoppingList.id}`);
  }, [selectedRecords]);

  return (
    <Stack align="stretch" justify="center">
      <Text size="xl">Last week's consumed products</Text>
      <Button onClick={createShoppingList}>Create shopping list</Button>
      <DataTable<ShoppingListItem>
        withBorder
        borderRadius="sm"
        withColumnBorders
        striped
        idAccessor="barcode"
        records={tableData}
        selectedRecords={selectedRecords}
        onSelectedRecordsChange={setSelectedRecords}
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
