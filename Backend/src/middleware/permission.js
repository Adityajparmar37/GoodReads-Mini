import {
  rolePermissions,
  permissionsLists,
  restrictedMembers,
  groupAccess,
} from "../utils/mapping.js";
import { findMemberById } from "../query/group.js";

export const setPermissions = async (ctx, next) => {
  const { role } = ctx.state?.group?.member;
  const permissionsGranted = ctx.request.body?.permissionsGranted ?? {};
  let permission = {};

  //check permissions
  Object.keys(permissionsGranted).forEach((key) => {
    if (!permissionsLists.has(key))
      ctx.throw(400, `Invalid permission: ${key}`);
    if (
      restrictedMembers[role] &&
      restrictedMembers[role].hasOwnProperty(key)
    ) {
      ctx.throw(403, `Cannot be granted permission: ${key}`);
    }
    permission = Object.freeze({
      ...permissionsGranted,
      ...rolePermissions[role],
    });
  });

  ctx.state.group.member.permissions = permission;

  await next();
};

export const checkAccess = (roles) => async (ctx, next) => {
  const userId = ctx.state.user;
  const groupId = ctx.params?.groupId;
  const query = {
    memberId: userId,
  };
  if (groupId) query.groupId = groupId;
  const userData = await findMemberById(query);

  if (!userData) ctx.throw(404, "User not found");

  if (!roles.includes(userData.role)) {
    ctx.throw(403, "Access denied, role not authorized");
  }

  const methodPermissions = groupAccess[ctx.request.method];
  if (!methodPermissions) ctx.throw(403, "Access denied, method not allowed");

  // Find the permission key that matches the requested URL using pattern matching
  const requiredPermissionKey = Object.keys(methodPermissions).find((key) => {
    return methodPermissions[key].some((urlPattern) => {
      // Convert ":param" format to regex pattern
      const regexPattern = urlPattern.replace(/:[^\/]+/g, "([^/]+)");
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(ctx.request.url);
    });
  });

  if (
    !requiredPermissionKey ||
    !userData.permissions?.[requiredPermissionKey]
  ) {
    ctx.throw(403, `Access denied, permission not granted`);
  }

  await next();
};
