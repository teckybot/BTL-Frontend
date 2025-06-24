// VideoUploadForm.jsx
import React, { useState } from "react";
import { Upload, Button, Form, message, Space } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const VideoUploadForm = ({ teamRegId, onPrev }) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const beforeUpload = (file) => {
    const isMp4 = file.type === "video/mp4";
    if (!isMp4) message.error("Only MP4 format is allowed.");

    const isLt30MB = file.size / 1024 / 1024 < 30;
    if (!isLt30MB) message.error("File must be smaller than 30MB.");

    const nameMatches = file.name.split(".")[0] === teamRegId;
    if (!nameMatches) message.error("Filename must match Team ID.");

    return isMp4 && isLt30MB && nameMatches;
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("video", fileList[0]);
    formData.append("teamRegId", teamRegId);

    try {
      setUploading(true);
      const res = await api.post("/submission/upload", formData);
      message.success("Uploaded successfully!");
      setFileList([]);
      navigate("/video-confirmation");
    } catch (err) {
      message.error(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Form layout="vertical">
      <Form.Item label="Upload Video (MP4, ≤ 30MB)">
        <Upload
          fileList={fileList}
          beforeUpload={(file) => {
            const isValid = beforeUpload(file);
            if (isValid) {
              setFileList([file]);
            }
            return false; // prevent auto upload
          }}
          onRemove={() => setFileList([])}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Select File</Button>
        </Upload>
      </Form.Item>

      <Space>
        <Button onClick={onPrev}>Previous</Button>

        <Button
          type="primary"
          onClick={handleUpload}
          disabled={fileList.length === 0}
          loading={uploading}
        >
          Submit
        </Button>
      </Space>
    </Form>
  );
};

export default VideoUploadForm;
