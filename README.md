# use-props-observable

A react hook for writing components in terms of [rxjs](https://github.com/ReactiveX/RxJS) `Observable<Props>`.

## Usage

```bash
npm i use-props-observable
```

## Example

```typescript
import { map, startWith, scan, switchAll } from "rxjs/operators";
import { interval, BehaviorSubject } from "rxjs";

import usePropsObservable from "use-props-observable";

function Time(props: {}) {
  return usePropsObservable(props, () =>
    interval(1000).pipe(
      startWith(0),
      map(() => new Date()),
      map((d) => <h1>The time is {d.toLocaleTimeString()}</h1>)
    )
  );
}

function Counter(props: { startAt: number }) {
  return usePropsObservable(props, (props$) =>
    props$.pipe(
      map(({ startAt }) => {
        const delta$ = new BehaviorSubject<number>(0);

        return delta$.pipe(
          scan((p, c) => p + c, startAt),
          map((count) => (
            <p>
              Current count: <strong>{count}</strong>
              <button onClick={() => delta$.next(-1)}>-</button>
              <button onClick={() => delta$.next(1)}>+</button>
            </p>
          ))
        );
      }),
      switchAll()
    )
  );
}

function Examples() {
  return (
    <section>
      <Time />
      <Counter startAt={3} />
    </section>
  );
}
```

## Why not just `.subscribe` in a `useEffect` and set state?

A naive implementation will lead to multiple re-renders, this library attempts to reduce them.

## Why a hook?

Writing this library as a React hook allows for easy usage with other hooks (for example `useRef`) and a better experience using the developer tools.
