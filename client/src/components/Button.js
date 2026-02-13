// Button.js
const Button = ({ text, onClick }) => (
  <button onClick={onClick} className="w-full bg-blue-500 text-white py-2 rounded">{text}</button>
);

export default Button;
