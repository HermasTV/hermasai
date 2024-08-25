import Link from "next/link";

export function HomeLink({ href, children }) {
  return (
    <Link
      href={href}
      className="basis-1/2 before:absolute before:bg-white before:block before:duration-500 before:h-[2px] before:left-1/2 before:-translate-x-1/2 before:w-0 before:transition-all p-4 mx-5 text-center transition-[letter-spacing] duration-700 hover:tracking-[0.3rem] hover:before:w-[80%] hover:after:w-[80%] focus:outline-none focus-visible:tracking-[0.3rem] focus-visible:before:w-[80%] focus-visible:after:w-[80%] after:absolute after:bg-white after:block after:duration-500 after:h-[2px] after:left-1/2 after:-translate-x-1/2 after:w-0 after:transition-all w-full relative before:top-2 after:bottom-2"
    >
      {children}
    </Link>
  );
}
