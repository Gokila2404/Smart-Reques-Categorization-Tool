// Alert.js
const Alert = ({ message, type }) => (
  <div className={`p-3 mb-3 rounded ${type === "error" ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"}`}>
    {message}
  </div>
);

export default Alert;
