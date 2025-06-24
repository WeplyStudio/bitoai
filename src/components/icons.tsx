export const BitoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="8" cy="8" r="2" fill="currentColor"/>
      <circle cx="12" cy="8" r="2" fill="currentColor"/>
      <circle cx="16" cy="8" r="2" fill="currentColor"/>
      <circle cx="8" cy="12" r="2" fill="currentColor"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
      <circle cx="16" cy="16" r="2" fill="currentColor"/>
      <circle cx="8" cy="16" r="2" fill="currentColor"/>
      <circle cx="12" cy="16" r="2" fill="currentColor"/>
    </svg>
);

export const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
);
