# use-props-observable

A react hook for [rxjs](https://github.com/ReactiveX/RxJS) `Observable`s.

## Example

```typescript
import usePropsObservable from "use-props-observable";

function Time() {
  const timeMsg = usePropsObservable({}, () =>
    interval(1000).pipe(
      startWith(0),
      map(() => new Date()),
      map((d) => `The time is ${d.toLocaleTimeString()}`)
    )
  );

  return <p>{timeMsg}</p>;
}

function MessageBox(props: { message: string }) {
  return usePropsObservable(props, (props$) => {
    const count$ = props$.pipe(scan((p, _c) => p + 1, -1));
    const lastFew$ = props$.pipe(
      pairwise(),
      map(([first]) => first),
      scan((p, { message }) => [message].concat(p).slice(0, 3), [] as string[]),
      startWith([] as string[])
    );

    return combineLatest(props$, count$, lastFew$).pipe(
      map(([{ message }, count, lastFew]) => (
        <>
          <h1>{message}</h1>
          <p>
            My message has changed <strong>{count}</strong> times
          </p>
          <ul>
            {lastFew.map((m, idx) => (
              <li key={idx}>{m}</li>
            ))}
          </ul>
        </>
      ))
    );
  });
}
```

## Usage

```bash
npm i use-props-observable
```

The hook is exported as the module's default export:

```typescript
export default function usePropsObservable<Props extends object, Output>(
  props: Props,
  render: (props$: Observable<Props>) => Observable<Output>,
  compare?: (a: Props, b: Props) => boolean
): Output;
```

Some trade-offs were made for a more pleasant API:

- Only the first instance of the render function will be used for the lifetime of the component, passing in a different one in another render will do nothing.
- The `Observable` returned by the render function must emit at least one value immediately.

## Why not just `.subscribe` in a `useEffect` and set state?

A naive implementation will lead to multiple re-renders, this library attempts to reduce them.

## Why a hook?

Writing this library as a React hook allows for easy usage with other hooks (for example `useRef`) and a better experience using the developer tools.
