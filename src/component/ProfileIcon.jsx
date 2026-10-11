export default function ProfileIcon({ kind = 'user' }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === 'logout' ? (
        <>
          <path d="M9 4H4v16h5M14 8l4 4-4 4M8 12h10" />
        </>
      ) : (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
        </>
      )}
    </svg>
  );
}
