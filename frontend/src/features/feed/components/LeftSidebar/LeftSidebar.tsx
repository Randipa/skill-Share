import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../../../../utils/api";
import { IUser } from "../../../authentication/contexts/AuthenticationContextProvider";
import { IConnection } from "../../../networking/components/Connection/Connection";
import { useWebSocket } from "../../../ws/WebSocketContextProvider";
import classes from "./LeftSidebar.module.scss";
interface ILeftSidebarProps {
  user: IUser | null;
}
export function LeftSidebar({ user }: ILeftSidebarProps) {
  const [connections, setConnections] = useState<IConnection[]>([]);
  const ws = useWebSocket();
  const navigate = useNavigate();

  useEffect(() => {
    request<IConnection[]>({
      endpoint: "/api/v1/networking/connections?userId=" + user?.id,
      onSuccess: (data) => setConnections(data),
      onFailure: (error) => console.log(error),
    });
  }, [user?.id]);

  useEffect(() => {
    const subscription = ws?.subscribe(
      "/topic/users/" + user?.id + "/connections/accepted",
      (data) => {
        const connection = JSON.parse(data.body);
        setConnections((connections) => [...connections, connection]);
      }
    );

    return () => subscription?.unsubscribe();
  }, [user?.id, ws]);

  useEffect(() => {
    const subscription = ws?.subscribe(
      "/topic/users/" + user?.id + "/connections/remove",
      (data) => {
        const connection = JSON.parse(data.body);
        setConnections((connections) => connections.filter((c) => c.id !== connection.id));
      }
    );

    return () => subscription?.unsubscribe();
  }, [user?.id, ws]);

  return (
    <div className={classes.root}>
      
  
        <button className={classes.item} onClick={() => navigate("/network/connections")}>
          <span className={classes.label}>Friends</span>
          <span className={classes.value}>
            {connections.filter((connection) => connection.status === "ACCEPTED").length}
          </span>
        </button>
      </div>

  );
}
