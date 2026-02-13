import React, { useState, useContext } from "react";
import InputField from "../components/InputField";
import Button from "../components/Button";
import Alert from "../components/Alert";
import { createComplaint } from "../services/api";
import { AuthContext } from "../context/AuthContext";

const CreateComplaint = ({ onComplaintCreated }) => {
  const { auth } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submitComplaint = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!title || !description) {
      setError("All fields are required");
      return;
    }

    try {
      await createComplaint({ title, description }, auth.token);
      setSuccess("Complaint submitted successfully");
      setTitle(""); setDescription("");
      if (onComplaintCreated) onComplaintCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">Submit a Complaint</h2>
      {error && <Alert message={error} type="error" />}
      {success && <Alert message={success} type="success" />}
      <form onSubmit={submitComplaint}>
        <InputField label="Title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="mb-4">
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            placeholder="Describe your complaint..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={4}
          />
        </div>
        <Button text="Submit Complaint" />
      </form>
    </div>
  );
};

export default CreateComplaint;
