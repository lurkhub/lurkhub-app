'use client';


type LoadingMessageProps = {
  text?: string;
};

export default function LoadingMessage({ text = "Loading..." }: LoadingMessageProps) {
  return (
    <div className="p-4 flex items-center justify-center h-40 text-gray-600">
      <svg className="animate-spin h-6 w-6 mr-2 text-blue-500" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {text}
    </div>
  );
}
