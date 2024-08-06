import HighlightedText from "./components/highligted-text/highlightedText";
import ImageSlider from "./components/image-slider/image-slider";

export default function Home() {
  return (
    <main className="pt-20 flex flex-col min-h-screen justify-between">
      <section className="w-full mx-auto border-l-2 border-dashed border-gray-600 pl-4 flex flex-col mt-10 lg:flex-row lg:w-[90%]">
        <div className="flex flex-col lg:w-1/2 md:gap-20 p-6">
          <HighlightedText />

          <p className="text-java-100 text-lg mt-4 lg:w-[70%]">
            Funtail is a cloud-based image optimization and storage solution
            that uses AI to optimize images for the web. Funtail intelligently
            stores images in the cloud, making it easy to access and manage your
            images from anywhere.
          </p>
        </div>

        <div className="lg:w-1/2 mt-8 lg:mt-0">
          <ImageSlider />
        </div>
      </section>
    </main>
  );
}
