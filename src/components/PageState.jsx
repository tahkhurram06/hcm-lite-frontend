export default function PageState({ text, error = false }) {
  return (
    <div className="p-8 flex flex-col items-center justify-center text-center animate-fade-in">
      {!error ? (
        <div className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-indigo-600 animate-spin mb-3" />
      ) : (
        <div className="h-10 w-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-3 animate-pop">
          !
        </div>
      )}
      <div className={`text-sm ${error ? "text-red-600" : "text-gray-500"}`}>{text}</div>
    </div>
  );
}