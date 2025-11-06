export default function Footer() {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white mt-auto transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 dark:text-green-400">Meritech Building Technology</h3>
            <p className="text-gray-300 dark:text-gray-400 mb-2">
              A leading provider of premium building materials and interior decoration solutions. We are committed to delivering excellence in construction and design.
            </p>
            <p className="text-gray-300 dark:text-gray-400">
              With years of experience in the industry, we offer a wide range of high-quality products to meet all your construction and interior design needs.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 dark:text-green-400">Address</h3>
            <p className="text-gray-300 dark:text-gray-400">Block E2-118,103 Ultra Modern Market</p>
            <p className="text-gray-300 dark:text-gray-400">By Ezenei Junction Along Asaba-Benin Expressway</p>
            <p className="text-gray-300 dark:text-gray-400">Asaba, Delta State, Nigeria</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 dark:text-green-400">Contact Us</h3>
            <p className="text-gray-300 dark:text-gray-400">Email: info@meritechbuilding.com</p>
            <p className="text-gray-300 dark:text-gray-400">Phone: (+234) 703 072 5881</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 dark:text-green-400">Hours</h3>
            <p className="text-gray-300 dark:text-gray-400">Mon-Fri: 8:00 AM - 6:00 PM</p>
            <p className="text-gray-300 dark:text-gray-400">Sat: 9:00 AM - 5:00 PM</p>
          </div>
         
        </div>
        <div className="border-t border-gray-700 dark:border-gray-700 mt-8 pt-4 text-center text-gray-400 dark:text-gray-500">
          <p>&copy; {new Date().getFullYear()} Meritech Building Technology. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
