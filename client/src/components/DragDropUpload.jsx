import React, { useState, useRef } from "react";
import { CloudUploadIcon } from "./Icons";
import "./DragDropUpload.css";

const DragDropUpload = ({ onFileSelect, accept = "*" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`drag-drop-upload ${isDragging ? "dragging" : ""}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        style={{ display: "none" }}
      />
      <div className="drag-drop-content">
        <div className="drag-drop-icon">
          <CloudUploadIcon size={34} color="#06b6d4" />
        </div>
        <p className="drag-drop-text">
          {isDragging ? "Drop file to inspect" : "Drag & drop file or click to browse"}
        </p>
        <p className="drag-drop-subtext">All document, executable, and archive formats supported</p>
      </div>
    </div>
  );
};

export default DragDropUpload;
