import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../../components/Button/Button";
import { Loader } from "../../../../components/Loader/Loader";
import { request } from "../../../../utils/api";
import { IUser } from "../../../authentication/contexts/AuthenticationContextProvider";
import { IConnection } from "../../../networking/components/Connection/Connection";
import classes from "./RightSidebar.module.scss";
export function RightSidebar() {
  const [suggestions, setSuggestions] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    request<IUser[]>({
      endpoint: "/api/v1/networking/suggestions?limit=2",
      onSuccess: (data) => {
        if (id) {
          setSuggestions(data.filter((s) => s.id !== id));
        } else {
          setSuggestions(data);
        }
      },
      onFailure: (error) => console.log(error),
    }).then(() => setLoading(false));
  }, [id]);

  return (
    <div className={classes.root}>
      
    </div>
  );
}
