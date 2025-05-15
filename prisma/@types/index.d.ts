import type {
  PermActions,
  PermmissionResource,
} from '../../src/casl/casl.service';

declare global {
  namespace PrismaJson {
    type PermissionList = Array<{
      action: PermActions;
      resource: PermissionResource;
      condition?: Record<string, any>
    }>
  }
}