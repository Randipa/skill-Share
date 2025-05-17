import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Button } from "../../../../components/Button/Button";
import { Input } from "../../../../components/Input/Input";
import { request } from "../../../../utils/api";
import { IUser } from "../../../authentication/contexts/AuthenticationContextProvider";
import { IConnection } from "../../../networking/components/Connection/Connection";
import { ProfileAndCoverPictureUpdateModal } from "../ProfileAndCoverPictureUpdateModal/ProfileAndCoverPictureUpdateModal";
import classes from "./Header.module.scss";
interface ITopProps {
  user: IUser | null;
  authUser: IUser | null;
  onUpdate: (user: IUser) => void;
}
export function Header({ user, authUser, onUpdate }: ITopProps) {
  const [editingInfo, setEditingInfo] = useState(false);
  const [editingProfilePicture, setEditingProfilePicture] = useState(false);
  const [editingCoverPicture, setEditingCoverPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [info, setInfo] = useState({
    firstName: authUser?.firstName,
    lastName: authUser?.lastName,
    position: authUser?.position,
    company: authUser?.company,
    location: authUser?.location,
  });
  const [connexions, setConnections] = useState<IConnection[]>([]);
  const [invitations, setInvitations] = useState<IConnection[]>([]);
  const connection =
    connexions.find((c) => c.recipient.id === user?.id || c.author.id === user?.id) ||
    invitations.find((c) => c.recipient.id === user?.id || c.author.id === user?.id);

  const [newProfilePicture, setNewProfilePicture] = useState<File | undefined | null>();
  const [newProfilePicturePreview, setNewProfilePicturePreview] = useState<string | null>(
    user?.profilePicture
      ? `${import.meta.env.VITE_API_URL}/api/v1/storage/${user?.profilePicture}`
      : "/avatar.svg"
  );
  const [newCoverPicture, setNewCoverPicture] = useState<File | undefined | null>();
  const [newCoverPicturePreview, setNewCoverPicturePreview] = useState<string | null>(
    user?.coverPicture
      ? `${import.meta.env.VITE_API_URL}/api/v1/storage/${user?.coverPicture}`
      : "/cover.jpeg"
  );

  useEffect(() => {
    request<IConnection[]>({
      endpoint: "/api/v1/networking/connections",
      onSuccess: (data) => setConnections(data),
      onFailure: (error) => console.log(error),
    });
  }, []);

  useEffect(() => {
    request<IConnection[]>({
      endpoint: "/api/v1/networking/connections?status=PENDING",
      onSuccess: (data) => setInvitations(data),
      onFailure: (error) => console.log(error),
    });
  }, [user?.id]);

  async function updateInfo() {
    await request<IUser>({
      endpoint: `/api/v1/authentication/profile/${user?.id}/info?firstName=${info.firstName}&lastName=${info.lastName}&position=${info.position}&company=${info.company}&location=${info.location}`,
      contentType: "multipart/form-data",
      method: "PUT",
      onSuccess: (data) => {
        onUpdate(data);
        setEditingInfo(false);
      },
      onFailure: (error) => console.log(error),
    });
    setEditingInfo(false);
  }

  async function updateProfilePicture() {
    const formData = new FormData();
    formData.append(
      "profilePicture",
      newProfilePicture === null
        ? ""
        : newProfilePicture
        ? newProfilePicture
        : user?.profilePicture || ""
    );

    await request<IUser>({
      endpoint: `/api/v1/authentication/profile/${user?.id}/profile-picture`,
      method: "PUT",
      contentType: "multipart/form-data",
      body: formData,
      onSuccess: (data) => {
        onUpdate(data);
        setEditingProfilePicture(false);
      },
      onFailure: (error) => console.log(error),
    });
  }

  async function updateCoverPicture() {
    const formData = new FormData();
    formData.append(
      "coverPicture",
      newCoverPicture === null ? "" : newCoverPicture ? newCoverPicture : user?.coverPicture || ""
    );

    await request<IUser>({
      endpoint: `/api/v1/authentication/profile/${user?.id}/cover-picture`,
      method: "PUT",
      contentType: "multipart/form-data",
      body: formData,
      onSuccess: (data) => {
        onUpdate(data);
        setEditingCoverPicture(false);
      },
      onFailure: (error) => console.log(error),
    });
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: "profile" | "cover") => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "profile") {
        setNewProfilePicture(file);
      } else {
        setNewCoverPicture(file);
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (type === "profile") {
          setNewProfilePicturePreview(reader.result as string);
        } else {
          setNewCoverPicturePreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={classes.header}>
      
    </div>
  );
}
