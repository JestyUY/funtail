import Link from "next/link";

export default function Page() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-24 px-6 sm:px-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 text-center text-java-50">
          AI-Based Image Storage and Optimization
        </h1>
        <div className=" bg-opacity-10 rounded-lg shadow-lg p-6 sm:p-8">
          <p className="text-lg sm:text-xl text-custom-color mb-4 text-java-50">
            This project leverages the power of artificial intelligence to
            optimize and store images efficiently. By combining cutting-edge
            technologies such as Next.js 14, Tailwind CSS, and Drizzle, we have
            created a robust solution for handling image assets.
          </p>
          <p className="text-lg sm:text-xl text-gray-400 mb-4">
            At the core of our project lies the Sharp library, a
            high-performance image processing library for Node.js. With Sharp,
            we can efficiently resize, compress, and manipulate images to ensure
            optimal file sizes without compromising quality. This enables faster
            load times and improved user experience across various devices and
            network conditions.
          </p>
          <p className="text-lg sm:text-xl text-gray-400 mb-4">
            To store the optimized images, we utilize Vercel&apos;s powerful
            database and blob storage capabilities. Vercel DB provides a
            scalable and reliable solution for storing image metadata, while
            Vercel Blob Storage offers a fast and efficient way to store the
            actual image files. This combination allows for seamless integration
            and retrieval of images within our application.
          </p>
          <p className="text-lg sm:text-xl text-gray-400 mb-8">
            By leveraging the capabilities of Next.js 14, we have built a modern
            and performant web application that delivers an exceptional user
            experience. The integration of Tailwind CSS enables us to create
            visually appealing and responsive user interfaces with ease,
            ensuring a consistent look and feel across different devices and
            screen sizes.
          </p>
          <div className="flex justify-center"></div>
        </div>
      </div>
    </main>
  );
}
