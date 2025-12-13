const InputText = (props) => (
  <input
    id="upload"
    {...props}
    style={{
      padding: "8px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      ...props.style,
    }}
  />
);

export default InputText;
