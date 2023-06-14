import { Link } from "react-router-dom";
import { Stack } from "@mantine/core";
import { useEffect, useState } from "react";

import { ShoppingList } from "../schema";

export default function ShoppingListListScreen() {
  const [shoppinglists, setShoppinglists] = useState<Array<ShoppingList>>([]);

  useEffect(() => {
    const keys = Object.keys(localStorage)
      .filter((key) => key.startsWith("shoppinglist-"))
      .map((key) => key.replace("shoppinglist-", ""))
      .sort((a, b) => parseInt(a) - parseInt(b));

    setShoppinglists(
      keys.map((key) =>
        JSON.parse(localStorage.getItem(`shoppinglist-${key}`) as string)
      )
    );
  }, []);

  return (
    <Stack align="stretch" justify="center">
      {shoppinglists.map((sl) => (
        <div>
          <Link key={sl.id} to={`/shoppinglist/${sl.id}`}>
            {sl.name}
          </Link>
        </div>
      ))}
    </Stack>
  );
}
