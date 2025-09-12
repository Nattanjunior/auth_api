import { AbilityBuilder, PureAbility } from '@casl/ability';
import { createPrismaAbility, Subjects, type PrismaQuery } from '@casl/prisma';
import { Injectable, Scope } from '@nestjs/common';
import { Post, User, Roles } from '@prisma/client';

export type PermActions = 'manage' | 'create' | 'read' | 'update' | 'delete'

export type PermissionResource = Subjects<{ User: User, Post: Post }> | 'all';

export type AppAbility = PureAbility<
  [PermActions, PermissionResource],
  PrismaQuery>

export type DefinePermissions = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void;

const rolePermissionsMap: Record<Roles, DefinePermissions> = {
  ADMIN(user, { can }) {
    can('manage', 'all')
  },
  EDITOR(user, { can }) {
    can('create', 'Post');
    can('read', 'Post');
    can('update', 'Post');
    can('read', 'User');
  },
  WRITER(user, { can }) {
    can('create', 'Post');
    can('read', 'Post', { authorId: user.id });
    can('update', 'Post', { authorId: user.id });
    can('read', 'User');
  },
  READER(user, { can }) {
    can('read', 'Post', { published: true });
    can('read', 'User');
    can('update', 'User', { id: user.id });
  },
}


type PermissionList = Array<{
  action: PermActions;
  resource: PermissionResource;
  condition?: Record<string, any>;
}>;

@Injectable({ scope: Scope.REQUEST })
export class CaslService {
  ability: AppAbility;

  createForUser(user: User) {
    const builder = new AbilityBuilder<AppAbility>(createPrismaAbility);
    
    rolePermissionsMap[user.role](user, builder);
    
    if (Array.isArray(user.permissions)) {
      (user.permissions as PermissionList).forEach((permission) => {
        if (
          permission &&
          typeof permission === 'object' &&
          typeof permission.action === 'string' &&
          typeof permission.resource === 'string'
        ) {
          builder.can(
            permission.action as PermActions,
            permission.resource,
            permission.condition
          );
        }
      });
    }
    
    this.ability = builder.build();
    return this.ability;
  }
}
