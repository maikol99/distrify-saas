import Cookies from "js-cookie";

export const adminGuard = (_to, _from, next) => {
  const userInfo = Cookies.get("user_info");

  if (!userInfo) {
    return next("/autorizacion-denegada");
  }

  try {
    const parsedUserInfo = JSON.parse(userInfo);
    if (parsedUserInfo.isAdmin === true) {
      next();
    } else {
      next("/autorizacion-denegada");
    }
  } catch {
    next("/autorizacion-denegada");
  }
};
