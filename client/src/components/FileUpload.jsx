import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import DragDropUpload from "./DragDropUpload";
import api from "../api";
import {
  LockIcon,
  UnlockIcon,
  CloudIcon,
  ZapIcon,
  DownloadIcon,
  TrashIcon,
  RefreshIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  FileIcon,
  ShieldCheckIcon,
  CloudUploadIcon
} from "./Icons";
import "./FileUpload.css";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [storageProvider, setStorageProvider] = useState("cloudinary"); // 'cloudinary' | 's3'
  const [encrypt, setEncrypt] = useState(true);
  const [loading, setLoading] = useState(false);
  const [vaultFiles, setVaultFiles] = useState([]);
  const [loadingVault, setLoadingVault] = useState(true);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 4000);
  };

  const fetchMyFiles = async () => {
    setLoadingVault(true);
    try {
      const res = await api.get("/files/my-files");
      if (res.data?.success) {
        setVaultFiles(res.data.files || []);
      }
    } catch (err) {
      console.warn("Fetch vault files error:", err.message);
    } finally {
      setLoadingVault(false);
    }
  };

  useEffect(() => {
    fetchMyFiles();
  }, []);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      showAlert("Please select or drop a file to upload.", "error");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("storageProvider", storageProvider);
    formData.append("isEncrypted", encrypt ? "true" : "false");

    try {
      const res = await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        showAlert(
          `File successfully secured in ${
            storageProvider === "s3" ? "AWS S3" : "Cloudinary"
          } with ${encrypt ? "AES-256-GCM encryption" : "standard cloud storage"}.`,
          "success"
        );
        setFile(null);
        fetchMyFiles();
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errMsg = error.response?.data?.details || error.response?.data?.error || "Upload failed. Please check your storage settings.";
      showAlert(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileItem) => {
    setDownloadingId(fileItem._id);
    try {
      const res = await api.get(`/files/download/${fileItem._id}`, {
        responseType: "blob",
      });

      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", fileItem.originalName || "downloaded-file");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      showAlert(`Downloaded & decrypted ${fileItem.originalName}!`, "success");
    } catch (err) {
      console.error("Download error:", err);
      showAlert("Download or decryption failed. Please try again.", "error");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to permanently purge "${fileName}" from cloud storage?`)) {
      return;
    }

    setDeletingId(fileId);
    try {
      const res = await api.delete(`/files/${fileId}`);
      if (res.data?.success) {
        showAlert(`File purged from vault!`, "success");
        setVaultFiles((prev) => prev.filter((f) => f._id !== fileId));
      }
    } catch (err) {
      console.error("Delete error:", err);
      showAlert("Failed to delete file.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      <div className="upload-page">
        {/* Header */}
        <div className="upload-header">
          <span className="vault-tag">
            <ShieldCheckIcon size={14} />
            ENCRYPTED CLOUD VAULT
          </span>
          <h1 className="main-heading">
            Zero-Knowledge <span className="gradient-text">Encrypted Storage</span>
          </h1>
          <p className="upload-subheading">
            Store documents with client-side AES-256-GCM ciphering. Flexible routing between Cloudinary CDN and AWS S3 buckets.
          </p>
        </div>

        {/* Alert Popup */}
        {alert.message && (
          <div className={`alert-popup ${alert.type}`}>
            <span className="alert-icon-wrap">
              {alert.type === "success" ? (
                <CheckCircleIcon size={18} color="#10b981" />
              ) : (
                <AlertTriangleIcon size={18} color="#f87171" />
              )}
            </span>
            <span>{alert.message}</span>
          </div>
        )}

        {/* Upload Config & Drag Zone */}
        <div className="upload-config-card">
          <div className="provider-selection-row">
            <label className="section-label">1. SELECT STORAGE BACKEND:</label>
            <div className="provider-pills">
              <button
                type="button"
                className={`provider-btn ${storageProvider === "cloudinary" ? "active-provider" : ""}`}
                onClick={() => setStorageProvider("cloudinary")}
              >
                <span className="p-icon"><ZapIcon size={18} /></span>
                <div className="p-text">
                  <strong>Cloudinary CDN</strong>
                  <small>Ultra-Fast Global Edge Cache</small>
                </div>
              </button>

              <button
                type="button"
                className={`provider-btn ${storageProvider === "s3" ? "active-provider" : ""}`}
                onClick={() => setStorageProvider("s3")}
              >
                <span className="p-icon"><CloudIcon size={18} /></span>
                <div className="p-text">
                  <strong>AWS S3 Bucket</strong>
                  <small>Private Object Cloud Storage</small>
                </div>
              </button>
            </div>
          </div>

          <div className="encryption-toggle-row">
            <div className="encryption-info">
              <span className="enc-icon"><LockIcon size={20} color="#22d3ee" /></span>
              <div>
                <strong>AES-256-GCM Cryptographic Protection</strong>
                <p>Authenticated encryption with random IV and 128-bit authentication tag.</p>
              </div>
            </div>
            <label className="switch-toggle">
              <input
                type="checkbox"
                checked={encrypt}
                onChange={(e) => setEncrypt(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {/* Drag & Drop Input Zone */}
          <div className="dropzone-area">
            <DragDropUpload onFileSelect={handleFileSelect} />
          </div>

          {/* Selected File Action Bar */}
          {file && (
            <div className="file-ready-bar">
              <div className="ready-info">
                <span className="ready-icon"><FileIcon size={22} /></span>
                <div>
                  <strong className="ready-name">{file.name}</strong>
                  <span className="ready-size">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; {file.type || "binary"}
                  </span>
                </div>
              </div>
              <button
                className="upload-btn 3d-btn"
                onClick={handleUpload}
                disabled={loading}
              >
                <CloudUploadIcon size={18} />
                <span>{loading ? "Encrypting & Uploading..." : `Secure to ${storageProvider.toUpperCase()}`}</span>
              </button>
            </div>
          )}
        </div>

        {/* Cloud Vault Table */}
        <div className="vault-container">
          <div className="vault-header">
            <div>
              <h3>Secure Cloud Vault ({vaultFiles.length})</h3>
              <p>Files stored with authenticated cryptographic tags and accessible only by your session.</p>
            </div>
            <button onClick={fetchMyFiles} className="refresh-vault-btn">
              <RefreshIcon size={14} />
              <span>Refresh</span>
            </button>
          </div>

          {loadingVault ? (
            <div className="vault-loading">
              <RefreshIcon size={24} className="spin-icon" />
              <p>Loading vault items...</p>
            </div>
          ) : vaultFiles.length === 0 ? (
            <div className="no-history">
              <div className="empty-vault-icon">
                <CloudIcon size={42} color="#64748b" />
              </div>
              <p>Your encrypted vault is currently empty.</p>
              <span>Upload your first document above to store it with AES-256 protection.</span>
            </div>
          ) : (
            <div className="vault-table-wrap">
              <table className="vault-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Size</th>
                    <th>Storage Engine</th>
                    <th>Encryption</th>
                    <th>Uploaded Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vaultFiles.map((item) => (
                    <tr key={item._id}>
                      <td className="file-name-cell">
                        <span className="file-item-icon"><FileIcon size={16} /></span>
                        <span className="file-item-title" title={item.originalName}>
                          {item.originalName}
                        </span>
                      </td>
                      <td className="file-size-cell">
                        {(item.size / 1024).toFixed(1)} KB
                      </td>
                      <td>
                        <span
                          className={`storage-badge ${
                            item.storageProvider === "s3"
                              ? "s3-badge"
                              : item.storageProvider === "local"
                              ? "local-badge"
                              : "cloudinary-badge"
                          }`}
                        >
                          {item.storageProvider === "s3" ? (
                            <><CloudIcon size={12} /> AWS S3</>
                          ) : item.storageProvider === "local" ? (
                            <><ShieldCheckIcon size={12} /> Secure Vault</>
                          ) : (
                            <><ZapIcon size={12} /> Cloudinary</>
                          )}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`enc-badge ${
                            item.isEncrypted ? "aes-badge" : "plain-badge"
                          }`}
                        >
                          {item.isEncrypted ? (
                            <><LockIcon size={12} /> AES-256</>
                          ) : (
                            <><UnlockIcon size={12} /> Plain</>
                          )}
                        </span>
                      </td>
                      <td className="date-cell">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="actions-cell">
                        <button
                          onClick={() => handleDownload(item)}
                          disabled={downloadingId === item._id}
                          className="action-btn download-btn"
                          title="Download & Decrypt"
                        >
                          <DownloadIcon size={14} />
                          <span>{downloadingId === item._id ? "Decrypting..." : "Decrypt"}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.originalName)}
                          disabled={deletingId === item._id}
                          className="action-btn delete-btn"
                          title="Purge File"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FileUpload;
