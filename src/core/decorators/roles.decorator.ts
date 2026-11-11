import { AppServices } from '@app/core/constants/app-svc.constant';
import { SetMetadata } from '@nestjs/common';
import { RoleType } from '../enum/role-type.enum';

export const HasRoles = (roles: RoleType[]) => SetMetadata(AppServices.HAS_ROLES, roles);
