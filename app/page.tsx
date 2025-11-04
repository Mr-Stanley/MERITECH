import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-green-700 text-white py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="relative h-24 w-24 md:h-32 md:w-32">
                <Image
                  src="/images/meritech-logos.jpg"
                  alt="MERITECH BUILDING TECHNOLOGIES"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to MERITECH BUILDING TECHNOLOGIES
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-2xl mx-auto">
              Discover our wide range of quality building materials and interior decoration products
              at your fingertips.
            </p>
            <Link
              href="/menu"
              className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              View Our Menu
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-[#FFF6E5] dark:bg-gray-800 transition-colors duration-300">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
              Why Choose MERITECH?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md dark:shadow-gray-900/50 text-center transition-colors duration-300">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  Mobile-Friendly
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Access our menu easily from any device with a simple QR code
                  scan.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md dark:shadow-gray-900/50 text-center transition-colors duration-300">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  Organized Categories
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Browse products by category for a seamless shopping experience.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md dark:shadow-gray-900/50 text-center transition-colors duration-300">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  Clear Pricing
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  See all prices upfront with detailed product descriptions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
