import { Observable, Subject, defer } from "rxjs";
import { finalize, map, take, takeWhile } from "rxjs/operators";
import { timer } from "rxjs";


export const prepare = <T>(callback: () => void) => {
	return (source: Observable<T>): Observable<T> =>
		defer(() => {
			callback();
			return source;
		});
};

export const indicate = <T>(indicator: Subject<boolean>) => {
	let alive = true;
	return (source: Observable<T>): Observable<T> =>
		source.pipe(
			prepare(() =>
				timer(500)
					.pipe(
						takeWhile(() => alive),
						take(1)
					)
					.subscribe(() => {
						indicator.next(true);
					})
			),
			finalize(() => {
				alive = false;
				indicator.next(false);
			})
		);
};

export const toClass = <T>(ClassType: { new(): T }) => (
	source: Observable<T>
) => source.pipe(map(val => Object.assign(new ClassType(), val)));
