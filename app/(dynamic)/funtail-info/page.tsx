export default function Page() {
  return (
    <main className="flex flex-col p-6 sm:p-8 w-full min-h-screen overflow-auto pt-24 mt-20">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-java-50 mb-8">
        New Zealand fantail
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="order-2 md:order-1">
          <p className="text-java-50 text-lg sm:text-xl mb-4">
            The fantail is one of the few native bird species in New Zealand
            that has been able to adapt to an environment greatly altered by
            humans. Originally a bird of open native forests and scrub, it is
            now also found in exotic plantation forests, in orchards and in
            gardens.
          </p>
          <p className="text-java-50 text-lg sm:text-xl mb-4">
            At times, fantails may appear far from any large stands of shrubs or
            trees, and it has an altitudinal range that extends from sea level
            to the snow line. Cats, rats, stoats and mynas are as great an enemy
            to fantails as they are to other native birds.
          </p>
          <p className="text-java-50 text-lg sm:text-xl">
            Of all the eggs and chicks fantails produce, only a few survive and
            grow up. However, the secret to fantails&rsquo; relative success
            compared to other native birds is their ability to produce lots of
            young. Some chicks are therefore likely to escape predation and
            populations can bounce back quickly after a decline. Its broad diet
            of small insects also makes the fantail resilient to environmental
            change, because certain insect populations increase in disturbed and
            deforested habitats.
          </p>
        </div>
        <div className="order-1 md:order-2">
          <div className="relative w-full h-64 sm:h-96 md:h-full">
            <div className="absolute inset-0">
              <img
                className="w-full h-full object-cover rounded-lg shadow-lg"
                src="https://kxcz1bsfyidjrxeu.public.blob.vercel-storage.com/landing%20slider-1722127779165-27qctuwTiOyCAtVatVzbsiC2BIhjv0.webp"
                alt="New Zealand fantail"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
