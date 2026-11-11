import { AppServices } from '@app/core/constants/app-svc.constant';
import { messageFactory, messages } from '@app/shared/messages.shared';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}
	canActivate(context: ExecutionContext): boolean {
		const roles = this.reflector.get<string[]>(AppServices.HAS_ROLES, context.getHandler());
		if (!roles) return true;
		const req = context.switchToHttp().getRequest();

		if (req.claims.roles && req.claims.roles.some((r: string) => roles.includes(r.toUpperCase()))) {
			return true;
		}
		throw new HttpException(messageFactory(messages.E4, [req.url]), HttpStatus.FORBIDDEN);
	}
}
