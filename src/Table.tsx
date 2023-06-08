import { Button, Modal } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import ItemForm, { type Values } from "./ItemForm";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useCallback, useMemo, useState } from "react";
import axios from "axios";
import { CopyToClipboard } from "react-copy-to-clipboard";

interface Product {
  barcode: string;
  name: string;
  image: string;
  brands: string;
  categories: string;
}

export default function Content() {
  const [editItem, setEditItem] = useState<Values | null>(null);

  const [items, setItems] = useLocalStorage<Array<Values>>({
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
    console.log("getProductsForItems", products);
    const itemsWithoutProducts = items.filter(
      (item) => !products.find((product) => product.barcode === item.code)
    );
    console.log(itemsWithoutProducts);
    if (itemsWithoutProducts.length === 0) return;
    console.log("itemsWithoutProducts");
    const barcodes = itemsWithoutProducts.map((item) => item.code);
    console.log(barcodes);
    for (const barcode of barcodes) {
      try {
        const response = await axios.get(
          `https://world.openfoodfacts.org/api/v2/product/${barcode}`
        );
        const product = response.data.product;
        const newProduct: Product = {
          barcode: barcode,
          name: product.product_name,
          image: product.image_front_small_url,
          brands: product.brands,
          categories: product.categories,
        };
        setProducts((products) => products.concat([newProduct]));
      } catch (error) {
        console.log(error);
      }
    }
    // window.location.reload();
  }, [items]);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "consumedAt",
    direction: "desc",
  });

  const tableData = useMemo(() => {
    const data = [...items];
    const colName = sortStatus.columnAccessor as keyof Values;
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
    async (editedItem: Values) => {
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
            initialValues={editItem}
          />
        ) : null}
      </Modal>

      <DataTable<Values>
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
            accessor: "consumedAt",
            sortable: true,
            render: (item) => item.consumedAt.replace("T", " ").split(".")[0],
          },
          {
            accessor: "code",
          },
          {
            accessor: "product_name",
            render: (item) => {
              const product = products.find((p) => p.barcode === item.code);
              if (!product) return "";
              return `${product.name} ${product.brands} ${product.categories}`;
            },
          },
          {
            accessor: "product_image",
            render: (item) => (
              <img
                src={products.find((p) => p.barcode === item.code)?.image}
                alt=""
              />
            ),
          },
        ]}
        onRowClick={(item) => setEditItem(item)}
      />

      <Button onClick={() => getProductsForItems()}>
        Get Products from Items
      </Button>

      <CopyToClipboard
        text={JSON.stringify(items)}
        onCopy={() => alert("copied")}
      >
        <Button>Copy to clipboard</Button>
      </CopyToClipboard>
    </>
  );
}
