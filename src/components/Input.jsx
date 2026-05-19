export default function Input({ label, id, ...props }) {
    return (
      <p className="my-2 flex flex-col">
        <label className="font-bold mb-2" htmlFor={id}>{label}</label>
        <input className="w-full max-w-[20rem] font-inherit p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500" id={id} name={id} required {...props} />
      </p>
    );
  }