/**

Parse strings like:

"stringOne:Hello_numberOne:5_lat:-32.3_lng:-141.55_isSomething:true"

Into:

@example
```
  {
    stringOne: "Hello",
    numberOne: 5,
    lat: -32.3,
    lng: -141.55,
    isSomething: true,
  }
```

*/

export function parse(src: string): Record<string, unknown> {
  return src.split("_").reduce(
    (acc, pair) => {
      const i = pair.indexOf(":");
      if (i === -1) return acc;
      const key = pair.slice(0, i);
      const raw = pair.slice(i + 1);
      return { ...acc, [key]: coerce(raw) };
    },
    {} as Record<string, unknown>,
  );
}

function coerce(raw: string): unknown {
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (raw === "null" || raw === "nil") return null;
  if (raw !== "" && !isNaN(Number(raw))) return Number(raw);
  return raw;
}
