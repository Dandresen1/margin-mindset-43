import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t border-primary/20">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Product Margin Reality Checker</h3>
            <p className="text-sm text-muted-foreground">
              Stop losing money on bad products. Get real margin analysis in seconds.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link to="/api" className="hover:text-primary transition-colors">API</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund" className="hover:text-primary transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary/20 mt-12 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Product Margin Reality Checker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};