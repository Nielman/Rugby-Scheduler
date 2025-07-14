
export function Button({ children, ...props }) {
  return (
    <button
      className="px-4 py-2 rounded-xl shadow bg-black text-white hover:opacity-80 transition"
      {...props}
    >
      {children}
    </button>
  );
}
