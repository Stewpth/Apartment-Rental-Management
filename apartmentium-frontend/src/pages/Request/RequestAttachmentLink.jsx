import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import api from "../../api/axios";

export default function RequestAttachmentLink({ file }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let objectUrl;
    let active = true;
    api
      .getFile(file.url)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        if (active) setUrl(objectUrl);
        else URL.revokeObjectURL(objectUrl);
      })
      .catch(() => {});
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file.url]);
  if (!url)
    return (
      <span>
        <FontAwesomeIcon icon={faPaperclip} /> {file.fileName} (loading)
      </span>
    );
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <FontAwesomeIcon icon={faPaperclip} /> {file.fileName}
    </a>
  );
}
