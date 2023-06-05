import { Modal } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import ItemForm, { type Values } from "./ItemForm";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useCallback, useMemo, useState } from "react";

export default function Content() {
  const [editItem, setEditItem] = useState<Values | null>(null);

  const [items, setItems] = useLocalStorage<Array<Values>>({
    key: "items",
    defaultValue: [],
  });

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
        ]}
        onRowClick={(item) => setEditItem(item)}
      />
    </>
  );
}
