function ShoppingCartIcon({ size = "lg", itemCount }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <div className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        className={`${sizeClasses[size] || sizeClasses.lg} transition-all duration-200 cursor-pointer group-hover:scale-105`}
      >
        <circle cx="256.4" cy="255.8" fill="#ca6a46" r="256" id="ICON" />
        <path fill="#1f3049" d="M298.7 137.9h87.7v87.6h-87.7z" transform="rotate(-45.001 342.537 181.676)" />
        <path fill="#e4c856" d="m352.7 114-87.2-9-64.8 64.7 87.3 9z" />
        <path fill="#2b5f87" d="M308.1 145h81.2v76.6h-81.2z" transform="rotate(-45.001 348.74 183.285)" />
        <path fill="#1f3049" d="m205.1 173.7 6.1 77.3 62 62 71.2-71.2-62-62z" />
        <path fill="#d5872a" d="m208.7 258 6.8-6.8-5.8-73.1 73.1 5.8 7.4-7.4-89.2-7.1 7.1 89.3c.1-.1.3-.4.6-.7z" />
        <path fill="#d5872a" d="M357.4 183.4h23.9v28h-23.9z" transform="rotate(-45.001 369.324 197.391)" />
        <circle cx="340.5" cy="168.6" fill="#87b7dd" r="16.2" transform="rotate(-45.001 340.523 168.621)" />
        <path fill="#2b5f87" d="M338.6 150h3.8v37.2h-3.8z" transform="rotate(-45.001 340.543 168.622)" />
        <path fill="#2b5f87" d="M322 166.7h37.2v3.8H322z" transform="rotate(-44.976 340.569 168.624)" />
        <path fill="#1f3049" d="M244 244.3h196.1v7.5H244z" transform="rotate(-45.001 342.027 248.039)" />
        <path fill="#1f3049" d="M108.4 251.1c12.7 2.5 25.3 5 38 7.4l-4.2-4.2c8.7 37.2 17.3 74.4 26 111.6.6 2.6 3.2 4.4 5.8 4.4h128c7.7 0 7.7-12 0-12H174c1.9 1.5 3.9 2.9 5.8 4.4-8.7-37.2-17.3-74.4-26-111.6-.4-1.9-2.2-3.8-4.2-4.2-12.7-2.5-25.3-5-38-7.4-7.6-1.5-10.8 10.1-3.2 11.6z" />
        <path fill="#fff" d="M359.1 249.3H168.6c-4.1 0-6.6 3.8-5.8 7.6 6.1 29.3 12.1 58.7 18.2 88 .5 2.6 3.2 4.4 5.8 4.4h126c2 .2 4.1-.6 5.3-3 15.4-29.3 30.8-58.7 46.1-88 2.2-4-.4-9-5.1-9zm-9.9 12c-2.6 5-5.2 9.9-7.8 14.9h-52.1v-14.9h59.9zm-25.2 48c-.3 0-.6-.1-.9-.1h-33.8v-21.1H335.1c-3.7 7.1-7.4 14.2-11.1 21.2zm-14.7 28h-20v-16h28.4c-2.8 5.3-5.6 10.6-8.4 16zm-32-49.2v21.1h-48.2v-21.1h48.2zm-48.2-12v-14.9h48.2v14.9h-48.2zm-12 33.2h-31.2c-1.5-7-2.9-14.1-4.4-21.1h35.6v21.1zm0 12v16h-25.4c-1.1-5.3-2.2-10.7-3.3-16h28.7zm12 0h48.2v16h-48.2v-16zm-12-60v14.9H179c-1-5-2.1-9.9-3.1-14.9h41.2z" />
        <circle fill="#1f3049" cx="185.1" cy="368.3" r="20" />
        <circle fill="#e1e1e1" cx="185.1" cy="368.3" r="12.5" />
        <circle fill="#1f3049" cx="185.1" cy="368.3" r="6.3" />
        <circle fill="#e1e1e1" cx="185.1" cy="368.3" r="4.9" />
        <circle fill="#1f3049" cx="293" cy="368.3" r="20" />
        <circle fill="#e1e1e1" cx="293" cy="368.3" r="12.5" />
        <circle fill="#1f3049" cx="293" cy="368.3" r="6.3" />
        <circle fill="#e1e1e1" cx="293" cy="368.3" r="4.9" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#EF9651] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
          {itemCount}
        </span>
      )}
    </div>
  );
}

export default ShoppingCartIcon;