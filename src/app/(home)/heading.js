export function Heading({ children }) {
  return (
    <div className="relative before:animate-heading-before-animation after:animate-heading-after-animation before:absolute before:bg-white before:block before:duration-500 before:h-[2px] before:left-1/2 before:-top-2 before:-translate-x-1/2 before:transition-all before:w-0 after:absolute after:bg-white after:block after:duration-500 after:h-[2px] after:left-1/2 after:-bottom-2 after:-translate-x-1/2 after:transition-all after:w-0">
      <h1 className="animate-fadeInRight animation-delay-1000 opacity-0 sm:text-7xl text-6xl xl:text-8xl">
        {children}
      </h1>
    </div>
  );
}
