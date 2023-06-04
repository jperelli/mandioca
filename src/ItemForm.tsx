import { useState } from "react";
import UUID from "pure-uuid";
import { useForm } from "@mantine/form";
import { IconCalendar } from "@tabler/icons-react";
import {
  Group,
  Button,
  Paper,
  Text,
  LoadingOverlay,
  useMantineTheme,
  Input,
  InputBase,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { getISODate } from "./utils";

export interface Values {
  id: string;
  consumedAt: string;
  code: string;
  code_format: string;
}

interface ItemFormProps {
  // onsubmit is a promise function that returns nothing
  onSubmit?: (values: Values) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  initialValues?: Partial<Values>;
}

export default function ItemForm(props: ItemFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useMantineTheme();

  const form = useForm<Values>({
    initialValues: {
      id: props.initialValues?.id || new UUID(4).toString(),
      consumedAt: props.initialValues?.consumedAt || getISODate(),
      code: props.initialValues?.code || "",
      code_format: props.initialValues?.code_format || "",
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
          placeholder="Consumed At"
          label="Consumed At"
          icon={<IconCalendar size={16} stroke={1.5} />}
          {...form.getInputProps("date")}
          value={new Date(form.values.consumedAt)}
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
