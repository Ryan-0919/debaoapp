export default function access(initialState: {currentUser?: {permissions?: string[]}} | undefined) {
  const permissions = new Set(initialState?.currentUser?.permissions ?? []);
  return {
    canAccessAdmin: Boolean(initialState?.currentUser),
    canReadUsers: permissions.has('users.read') || permissions.has('*')
  };
}
