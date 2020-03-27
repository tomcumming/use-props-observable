# use-props-observable

A react hook for [rxjs](https://github.com/ReactiveX/RxJS) `Observable`s.

## Usage

```bash
npm i use-props-observable
```

## Example

```typescript
import { map, startWith, scan, pairwise } from "rxjs/operators";
import { interval, combineLatest } from "rxjs";

import usePropsObservable from "use-props-observable";

function Time(props: {}) {
  const timeMsg = usePropsObservable(props, () =>
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

## Why not just `.subscribe` in a `useEffect` and set state?

A naive implementation will lead to multiple re-renders, this library attempts to reduce them.

## Why a hook?

Writing this library as a React hook allows for easy usage with other hooks (for example `useRef`) and a better experience using the developer tools.
