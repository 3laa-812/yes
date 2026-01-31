export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-black uppercase">
              About
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-black">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-black">
                  Sustainability
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-black">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-black uppercase">
              Support
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-black">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-black">
                  Shipping
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-black">
                  Returns
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-black uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-black">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-black">
                  Privacy
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-black uppercase">
              Newsletter
            </h3>
            <p className="mt-4 text-sm text-gray-500">
              Subscribe for the latest drops.
            </p>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-100 pt-8">
          <p className="text-sm text-gray-400 text-center">
            © {new Date().getFullYear()} ESSENCE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
