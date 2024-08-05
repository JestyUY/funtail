import ImageSlider from "@/app/components/image-slider/image-slider";

export default function Page() {
  return (
    <main className="flex flex-col p-8 w-full h-screen overflow-auto pt-24 ">
      <h2 className="text-6xl text-java-50">New Zealand fantail</h2>
      <aside className="w-full flex h-screen">
        <p className="text-java-50 w-[45%] ">
          The fantail is one of the few native bird species in New Zealand that
          has been able to adapt to an environment greatly altered by humans.
          Originally a bird of open native forests and scrub, it is now also
          found in exotic plantation forests, in orchards and in gardens. At
          times, fantails may appear far from any large stands of shrubs or
          trees, and it has an altitudinal range that extends from sea level to
          the snow line. Cats, rats, stoats and mynas are as great an enemy to
          fantails as they are to other native birds. Of all the eggs and chicks
          fantails produce, only a few survive and grow up. However, the secret
          to fantails’ relative success compared to other native birds is their
          ability to produce lots of young. Some chicks are therefore likely to
          escape predation and populations can bounce back quickly after a
          decline. Its broad diet of small insects also makes the fantail
          resilient to environmental change, because certain insect populations
          increase in disturbed and deforested habitats
        </p>
        <img
          className="w-1/2 h-full object-cover"
          src="https://kxcz1bsfyidjrxeu.public.blob.vercel-storage.com/landing%20slider-1722127779165-27qctuwTiOyCAtVatVzbsiC2BIhjv0.webp"
          alt=""
        />
      </aside>
    </main>
  );
}
