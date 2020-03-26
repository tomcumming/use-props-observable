import * as React from 'react';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged} from 'rxjs/operators';

export type Rendered = null | React.ReactElement;

function shallowCompare<T extends object>(
    a: T,
    b: T
): boolean {
    for(const k in a)
        if(!b.hasOwnProperty(k) || !Object.is(a[k], b[k]))
            return false;
    for(const k in b)
        if(!a.hasOwnProperty(k))
            return false;
    return true;
}

type State<Props> = {
    subj: BehaviorSubject<Props>;
    subs?: Subscription;
    last: Rendered;
    invalidatedCount: number;
    insideRender: boolean;
};

export default function usePropsObservable<Props extends object>(
    props: Props,
    render: (props$: Observable<Props>) => Observable<Rendered>,
    compare: (a: Props, b: Props) => boolean = shallowCompare
): Rendered {
    const ref = React.useRef<State<Props>>({
        subj: null as any, // limit constructer calls
        last: null,
        invalidatedCount: 0,
        insideRender: false
    });
    if(ref.current.subj === null)
        ref.current.subj = new BehaviorSubject(props);

    const [_invalidatedCount, setInvalidatedCount] = React.useState(ref.current.invalidatedCount);

    React.useEffect(() => () => ref.current.subs?.unsubscribe(), []);

    ref.current.insideRender = true;
    console.log('render start');

    if(!ref.current.subs) {
        ref.current.subs = render(ref.current.subj.pipe(distinctUntilChanged(compare))).subscribe(next => {
            ref.current.last = next;
            if(!ref.current.insideRender) {
                ref.current.invalidatedCount += 1;
                setInvalidatedCount(ref.current.invalidatedCount);
                console.log('setting state');
            } else {
                console.log('skipping state');
            }
        });
    } else {
        ref.current.subj.next(props);
    }

    ref.current.insideRender = false;
    console.log('render end');

    console.log('render', props, _invalidatedCount);

    return ref.current.last;
}
