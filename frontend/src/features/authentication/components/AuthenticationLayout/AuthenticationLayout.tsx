import { Outlet } from "react-router-dom";
import classes from "./AuthenticationLayout.module.scss";

export function AuthenticationLayout() {
  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <Outlet />
      </div>
    </div>
  );
}
