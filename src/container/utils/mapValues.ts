export default function mapValues<
  Obj extends Record<string, any>, // Use Record<string, any> to describe an object with string keys and any type of values.
  Res // Res represents the result type of the transformation function.
> (
  o: Obj, 
  func: (value: Obj[keyof Obj]) => Res // func transforms a value of Obj to a value of type Res.
): { [K in keyof Obj]: Res } { // The return type is an object with the same keys as Obj but values of type Res.
  const res: Partial<{ [K in keyof Obj]: Res }> = {}; // Use Partial here because we're incrementally building up res.
  for (const key in o) {
    if (o.hasOwnProperty(key)) {
      res[key] = func(o[key]); // Apply func to each value in o, assigning the result to the corresponding key in res.
    }
  }
  return res as { [K in keyof Obj]: Res }; // Cast res to its full type now that it's been fully populated.
}