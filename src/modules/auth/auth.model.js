const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  username: user.username,
  roleId: user.roleId,
  roleName: user.role?.roleName || user.roleName || null,
  profileImage: user.profileImage,
  status: user.status,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

module.exports = {
  sanitizeUser,
};
