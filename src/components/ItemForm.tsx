import UUID from "pure-uuid";
import {
  Button,
  Group,
  Input,
  InputBase,
  LoadingOverlay,
  NumberInput,
  Paper,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useState } from "react";

import { StockRecord } from "../schema";
import { getISODate } from "../utils";

interface StockRecordFormProps {
  // onsubmit is a promise function that returns nothing
  onSubmit?: (values: StockRecord) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  initialStockRecord?: Partial<StockRecord>;
}

export default function StockRecordForm(props: StockRecordFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useMantineTheme();

  const form = useForm<StockRecord>({
    initialValues: {
      id: props.initialStockRecord?.id || new UUID(4).toString(),
      executedAt: props.initialStockRecord?.executedAt || getISODate(),
      quantity: props.initialStockRecord?.quantity || 0,
      code: props.initialStockRecord?.code || "",
      code_format: props.initialStockRecord?.code_format || "",
    },
  });

  const handleSubmit = () => {
    setLoading(true);
    setError(null);
    props
      .onSubmit?.(form.values)
      .then(() => {
        setLoading(false);
        form.reset();
        form.setFieldValue("id", new UUID(4).toString());
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleDelete = () => {
    setLoading(true);
    setError(null);
    props
      .onDelete?.(form.values.id)
      .then(() => {
        setLoading(false);
        form.reset();
        form.setFieldValue("id", new UUID(4).toString());
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  return (
    <Paper
      sx={{
        backgroundColor:
          theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <LoadingOverlay visible={loading} />
        <Input type="hidden" {...form.getInputProps("id")} />
        <DateTimePicker
          mt="md"
          required
          placeholder="Executed At"
          label="Executed At"
          icon={<IconCalendar size={16} stroke={1.5} />}
          {...form.getInputProps("date")}
          value={new Date(form.values.executedAt)}
          onChange={(value) => form.setFieldValue("date", getISODate(value))}
        />
        <InputBase
          mt="md"
          required
          placeholder="Code"
          label="Code"
          {...form.getInputProps("code")}
        />
        <InputBase
          mt="md"
          required
          placeholder="Code Format"
          label="Code Format"
          {...form.getInputProps("code_format")}
        />
        <NumberInput
          mt="md"
          required
          placeholder="Quantity"
          label="Quantity"
          {...form.getInputProps("quantity")}
        />
        {error && (
          <Text color="red" size="sm" mt="sm">
            {error}
          </Text>
        )}
        <Group position="right" mt="xl">
          <Button color="red" onClick={handleDelete}>
            Delete
          </Button>
          <Button type="submit">Save</Button>
        </Group>
      </form>
    </Paper>
  );
}
