// Reusable error display box — shows a title and message in a red-tinted container
export default function Error({ title, message }) {
  return (
    <div className="w-[90%] max-w-[35rem] mx-auto my-8 p-4 bg-[#f9b8b8] text-[#6d0b0b] rounded-md text-center">
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}