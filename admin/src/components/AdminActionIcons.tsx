type IconProps = {
  className?: string;
};

export function EditIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M11.333 2.00001C11.5084 1.82445 11.7163 1.68506 11.9451 1.59128C12.174 1.49749 12.4191 1.45117 12.6667 1.45501C12.9142 1.45885 13.1577 1.51218 13.3836 1.61181C13.6095 1.71145 13.8132 1.85502 13.9836 2.03501C14.154 2.215 14.2872 2.42743 14.3759 2.65967C14.4646 2.89191 14.5068 3.13977 14.5 3.38868C14.4932 3.63759 14.4384 3.88271 14.3387 4.10934C14.239 4.33597 14.0967 4.53966 13.92 4.71334L6.62 12.0133L2.66667 13.3333L3.98667 9.38001L11.333 2.00001Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ViewIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M2 8C2 8 4.66667 3.33334 8 3.33334C11.3333 3.33334 14 8 14 8C14 8 11.3333 12.6667 8 12.6667C4.66667 12.6667 2 8 2 8Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function DeleteIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M2 4H14M6.66667 4V2.66667C6.66667 2.31305 6.80714 1.97391 7.05719 1.72386C7.30724 1.47381 7.64638 1.33334 8 1.33334C8.35362 1.33334 8.69276 1.47381 8.94281 1.72386C9.19286 1.97391 9.33333 2.31305 9.33333 2.66667V4M12.6667 4V13.3333C12.6667 13.687 12.5262 14.0261 12.2761 14.2761C12.0261 14.5262 11.687 14.6667 11.3333 14.6667H4.66667C4.31305 14.6667 3.97391 14.5262 3.72386 14.2761C3.47381 14.0261 3.33333 13.687 3.33333 13.3333V4H12.6667Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
