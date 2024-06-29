import { BackgroundParticles } from "./background-particles";
import { Heading } from "./heading";
import { HomeLink } from "./home-link";

export default function Page() {
  return (
    <>
      <BackgroundParticles />
      <div className="z-50 overflow-hidden relative grid place-items-center h-svh w-full">
        <div className="select-none text-center">
          <Heading>Hermas.ai</Heading>
          <p className="mt-8 sm:text-xl text-[#ccc] text-lg xl:text-2xl">
            Welcome to my Cloud Garage
          </p>
          <div className="flex gap-2 justify-center mt-7 lg:text-lg">
            <HomeLink href="/projects">Projects</HomeLink>
            <HomeLink href="/contact">Contact</HomeLink>
          </div>
        </div>
      </div>
    </>
  );
}
