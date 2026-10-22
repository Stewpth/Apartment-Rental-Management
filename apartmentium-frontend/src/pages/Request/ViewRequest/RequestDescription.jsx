import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExpand,
  faImage,
  faRectangleList,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

// I will use cloud storage to get the image soon
import faucetImage from "../../../assets/images/request-img-sample/faucet.jpg";
import sinkImage from "../../../assets/images/request-img-sample/kitchen-sink.png";
import "./ViewRequest.css";

const attachedPictures = [
  { name: "IMG_001.jpg", src: faucetImage, alt: "Leaking bathroom faucet" },
  { name: "IMG_002.jpg", src: sinkImage, alt: "Bathroom sink basin" },
];

export default function RequestDescription() {
  const [selectedPicture, setSelectedPicture] = useState(null);

  return (
    <>
      <section
        className="request-description-section"
        aria-label="Request description and attached pictures"
      >
        <div className="request-description-card">
          <h3>
            <FontAwesomeIcon icon={faRectangleList} /> Request Description
          </h3>
          <p>
            The bathroom faucet continues to leak even when fully closed. Water
            collects around the sink and needs to be checked.
          </p>
        </div>

        <div className="request-description-card request-attachments-card">
          <h3>
            <FontAwesomeIcon icon={faImage} /> Attached Pictures
          </h3>
          <div className="request-attachments-grid">
            {attachedPictures.map((picture) => (
              <button
                type="button"
                className="request-attachment"
                key={picture.name}
                onClick={() => setSelectedPicture(picture)}
                aria-label={`View ${picture.name}: ${picture.alt}`}
              >
                <img src={picture.src} alt={picture.alt} />
                <span>{picture.name}</span>
                <FontAwesomeIcon
                  className="request-attachment-expand"
                  icon={faExpand}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedPicture && (
        <div
          className="request-picture-lightbox"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setSelectedPicture(null)
          }
        >
          <div
            className="request-picture-lightbox-content"
            role="dialog"
            aria-modal="true"
            aria-label={selectedPicture.alt}
          >
            <button
              type="button"
              className="request-picture-lightbox-close"
              aria-label="Close image"
              onClick={() => setSelectedPicture(null)}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
            <img src={selectedPicture.src} alt={selectedPicture.alt} />
            <span>{selectedPicture.name}</span>
          </div>
        </div>
      )}
    </>
  );
}
