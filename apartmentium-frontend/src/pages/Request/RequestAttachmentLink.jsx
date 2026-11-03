import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import api from "../../api/axios";
import "./RequestAttachmentLink.css";

export default function RequestAttachmentLink({ file }) {
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let objectUrl;
    let active = true;
    setUrl("");
    setFailed(false);
    api
      .getFile(file.url)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        if (active) setUrl(objectUrl);
        else URL.revokeObjectURL(objectUrl);
      })
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file.url]);
  if (failed)
    return (
      <span className="request-attachment-message" role="status">
        <FontAwesomeIcon icon={faPaperclip} /> {file.fileName} (could not load)
      </span>
    );
  return (
    <div className="request-attachment-preview">
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" title={`Open ${file.fileName}`}>
          <img src={url} alt={file.fileName} />
          <span>
            <FontAwesomeIcon icon={faPaperclip} /> {file.fileName}
          </span>
        </a>
      ) : (
        <span className="request-attachment-message" role="status">
          Loading {file.fileName}…
        </span>
      )}
    </div>
  );
}
