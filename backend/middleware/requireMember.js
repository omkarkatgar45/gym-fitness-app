
function requireMember(req, res, next) {
  const roleId = Number(req.user?.roleId);
  const memberId = Number(req.user?.memberId);

  if (
    roleId !== 4 ||
    !Number.isInteger(memberId) ||
    memberId <= 0
  ) {
    return res.status(403).json({
      success: false,
      message: "Member access only.",
    });
  }

  req.memberId = memberId;
  next();
}

module.exports = requireMember;
