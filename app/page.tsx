import HighlightedText from "./components/highligted-text/highlightedText";
import ImageSlider from "./components/image-slider/image-slider";

export default function Home() {
  return (
    <main className="pt-20 flex flex-col h-screen  justify-between">
      <section
        className="w-[90%] h-[80%] mx-auto border-l-2 border-dashed border-gray-600 pl-4 flex-col
       flex mt-10 lg:flex-row "
      >
        <div className="flex lg:flex-col flex-row lg:w-1/2 p-6 justify-between">
          <HighlightedText />

          <p className="text-java-100 text-lg  mt-4 lg:w-[70%]">
            Funtail is a cloud-based image optimization and storage solution
            that uses AI to optimize images for the web. Funtail intelligently
            stores images in the cloud, making it easy to access and manage your
            images from anywhere.
          </p>
        </div>

        <ImageSlider />
      </section>
    </main>
  );
}
