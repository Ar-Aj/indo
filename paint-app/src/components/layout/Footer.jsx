import { Link } from 'react-router-dom';
import { Palette, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
    services: [
      { name: 'Paint Your Wall', href: '/paint-your-wall' },
      { name: 'Color Consultation', href: '/consultation' },
      { name: 'Professional Services', href: '/services' },
      { name: 'Bulk Orders', href: '/bulk' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Color Guide', href: '/guide' },
      { name: 'Mobile App', href: '/app' },
      { name: 'API Documentation', href: '/api' },
    ],
  };

  return (
    <footer className="bg-secondary-bg border-t border-border-color">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 text-primary-text mb-4">
              <Palette size={32} className="text-accent-color" />
              <span className="text-xl font-bold">PaintViz</span>
            </Link>
            <p className="text-secondary-text mb-4">
              Transform your space with AI-powered paint visualization. Choose from 2500+ colors and see your vision come to life.
            </p>
            <div className="space-y-2 text-sm text-secondary-text">
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <span>hello@paintviz.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <span>1-800-PAINT-VIZ</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>123 Color Street, Paint City, PC 12345</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-primary-text font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-secondary-text hover:text-primary-text transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-primary-text font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-secondary-text hover:text-primary-text transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-primary-text font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-secondary-text hover:text-primary-text transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-border-color">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-secondary-text text-sm">
              © {currentYear} PaintViz. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a 
                href="#" 
                className="text-secondary-text hover:text-primary-text transition-colors text-sm"
                aria-label="Facebook"
              >
                Facebook
              </a>
              <a 
                href="#" 
                className="text-secondary-text hover:text-primary-text transition-colors text-sm"
                aria-label="Twitter"
              >
                Twitter
              </a>
              <a 
                href="#" 
                className="text-secondary-text hover:text-primary-text transition-colors text-sm"
                aria-label="Instagram"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;