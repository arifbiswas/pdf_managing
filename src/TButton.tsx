const TButton = (props) => (
  <button
    id="merge"
    {...props}
    style={{
      padding: "10px 15px",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      ...props.style,
    }}
  />
);

export default TButton;
