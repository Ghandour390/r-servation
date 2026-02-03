import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { RESOURCE_KEY } from './resource-owner.decorator';

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.get(RESOURCE_KEY, context.getHandler());
    
    if (!resource) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = +request.params.id;

    if (user.role === 'ADMIN') {
      return true;
    }

    const item = await (this.prisma as any)[resource.resourceName].findUnique({
      where: { id: resourceId },
    });

    if (!item || item[resource.userIdField] !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
