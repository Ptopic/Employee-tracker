import {
	CallHandler,
	ExecutionContext,
	Injectable,
	Logger,
	NestInterceptor,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
	private readonly logger = new Logger(PerformanceInterceptor.name);

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const request = context.switchToHttp().getRequest();
		const now = Date.now();

		return next.handle().pipe(
			tap(() => {
				const duration = Date.now() - now;
				this.logger.log(`${request.method} ${request.url} ${duration}ms`);
			}),
		);
	}
}
