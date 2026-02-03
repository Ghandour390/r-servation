import { SetMetadata } from '@nestjs/common';

export const RESOURCE_KEY = 'resource';
export const ResourceOwner = (resourceName: string, userIdField: string = 'userId') => 
  SetMetadata(RESOURCE_KEY, { resourceName, userIdField });
