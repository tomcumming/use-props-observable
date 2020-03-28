import * as React from "react";
import { Observable, Subscription, BehaviorSubject } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";

const unsetValue = Symbol();

function shallowCompare<T extends object>(a: T, b: T): boolean {
  for (const k in a)
    if (!b.hasOwnProperty(k) || !Object.is(a[k], b[k])) return false;
  for (const k in b) if (!a.hasOwnProperty(k)) return false;
  return true;
}

type State<Props, Output> = {
  subj: BehaviorSubject<Props>;
  subs?: Subscription;
  deps?: unknown[];
  last: typeof unsetValue | Output;
  invalidatedCount: number;
  insideRender: boolean;
};

export default function usePropsObservable<Props extends object, Output>(
  props: Props,
  render: (props$: Observable<Props>) => Observable<Output>,
  deps: unknown[] = [],
  compare: (a: Props, b: Props) => boolean = shallowCompare
): Output {
  const ref = React.useRef<State<Props, Output>>({
    subj: null as any,
    last: unsetValue,
    invalidatedCount: 0,
    insideRender: false,
  });

  const [_invalidatedCount, setInvalidatedCount] = React.useState(
    ref.current.invalidatedCount
  );

  React.useEffect(() => () => ref.current.subs?.unsubscribe(), []);

  ref.current.insideRender = true;

  if (
    ref.current.deps === undefined ||
    !shallowCompare(ref.current.deps, deps)
  ) {
    ref.current.subs?.unsubscribe();
    ref.current.subj = new BehaviorSubject(props);
    ref.current.last = unsetValue;
    ref.current.deps = deps;
    ref.current.subs = render(
      ref.current.subj.pipe(distinctUntilChanged(compare))
    ).subscribe((next) => {
      ref.current.last = next;
      if (!ref.current.insideRender) {
        ref.current.invalidatedCount += 1;
        setInvalidatedCount(ref.current.invalidatedCount);
      }
    });
  } else {
    ref.current.subj.next(props);
  }

  ref.current.insideRender = false;

  if (ref.current.last === unsetValue)
    throw new Error(`A value must be emitted immediately`);

  return ref.current.last;
}
